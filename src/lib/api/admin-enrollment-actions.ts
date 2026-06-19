import {
  getEnrollmentById,
  updateEnrollmentStatus,
} from "@/lib/api/portal-data";
import {
  createUserWithPasswordHash,
  getUserByEmail,
  updateUserPasswordHash,
} from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { sendApprovalWelcomeNotifications } from "@/lib/notifications/approval-welcome";
import { sendRejectionNotifications } from "@/lib/notifications/rejection-notice";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import type { EnrollmentRecord } from "@/types/portal";

function formatNotificationSummary(
  parts: string[],
  warnings: string[],
  successPrefix: string
): string {
  if (parts.length > 0) return ` ${successPrefix} ${parts.join(" and ")}.`;
  if (warnings.length > 0) return ` ${successPrefix} but notifications failed: ${warnings.join("; ")}`;
  return "";
}

export async function approveEnrollmentAndCreateAccount(
  enrollmentId: string,
  adminUserId: string,
  adminNotes?: string
): Promise<{ enrollment: EnrollmentRecord | null; message: string; error?: string }> {
  const existing = await getEnrollmentById(enrollmentId);
  if (!existing) {
    return { enrollment: null, message: "", error: "Enrollment not found" };
  }
  if (existing.status !== "pending") {
    return { enrollment: null, message: "", error: "Enrollment is not pending" };
  }

  const enrollment = await updateEnrollmentStatus(
    enrollmentId,
    "approved",
    adminUserId,
    adminNotes
  );

  if (!enrollment) {
    return { enrollment: null, message: "", error: "Failed to update enrollment" };
  }

  const enrollmentRecord = await getEnrollmentById(enrollmentId);
  if (!enrollmentRecord) {
    return { enrollment, message: "Registration approved.", error: undefined };
  }

  const plainPassword = generateStudentPassword();
  const passwordHash = await hashPassword(plainPassword);
  const avatarInitials = enrollment.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const user = await getUserByEmail(enrollment.email);
  if (!user) {
    await createUserWithPasswordHash({
      email: enrollment.email,
      passwordHash,
      role: "student",
      name: enrollment.fullName,
      phone: enrollment.whatsapp,
      programSlug: enrollment.program,
      level: enrollment.level,
      batch: enrollment.batch,
      isActive: true,
      avatarInitials,
    });
  } else {
    await updateUserPasswordHash(user.id, passwordHash);
  }

  const notifications = await sendApprovalWelcomeNotifications({
    fullName: enrollmentRecord.fullName,
    email: enrollmentRecord.email,
    whatsapp: enrollmentRecord.whatsapp,
    program: enrollmentRecord.program,
    level: enrollmentRecord.level,
    password: plainPassword,
  });

  const parts: string[] = [];
  if (notifications.emailSent) parts.push("email sent");
  if (notifications.whatsappSent) parts.push("WhatsApp sent");

  const notificationSummary = formatNotificationSummary(
    parts,
    notifications.warnings,
    "Login details"
  );

  return {
    enrollment,
    message: `Registration approved.${notificationSummary}`,
  };
}

export async function rejectEnrollment(
  enrollmentId: string,
  adminUserId: string,
  adminNotes?: string
): Promise<{ enrollment: EnrollmentRecord | null; message: string; error?: string }> {
  const existing = await getEnrollmentById(enrollmentId);
  if (!existing) {
    return { enrollment: null, message: "", error: "Enrollment not found" };
  }
  if (existing.status !== "pending") {
    return { enrollment: null, message: "", error: "Enrollment is not pending" };
  }

  const enrollment = await updateEnrollmentStatus(
    enrollmentId,
    "rejected",
    adminUserId,
    adminNotes
  );

  if (!enrollment) {
    return { enrollment: null, message: "", error: "Failed to update enrollment" };
  }

  const notifications = await sendRejectionNotifications({
    fullName: enrollment.fullName,
    email: enrollment.email,
    whatsapp: enrollment.whatsapp,
    program: enrollment.program,
    level: enrollment.level,
    reason: adminNotes,
  });

  const parts: string[] = [];
  if (notifications.emailSent) parts.push("email sent");
  if (notifications.whatsappSent) parts.push("WhatsApp sent");

  const notificationSummary = formatNotificationSummary(
    parts,
    notifications.warnings,
    "Student notified via"
  );

  return {
    enrollment,
    message: `Registration rejected.${notificationSummary}`,
  };
}

export async function deleteEnrollmentRegistration(
  enrollmentId: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) {
    return { success: false, message: "", error: "Enrollment not found" };
  }

  let studentAccountRemoved = false;

  if (enrollment.status === "approved") {
    const student = await getUserByEmail(enrollment.email);
    if (student?.role === "student") {
      await prisma.assignmentSubmission.deleteMany({ where: { studentId: student.id } });
      await prisma.user.delete({ where: { id: student.id } });
      studentAccountRemoved = true;
    }
  }

  if (enrollment.paymentScreenshotPublicId) {
    void deleteCloudinaryImage(enrollment.paymentScreenshotPublicId);
  }
  if (enrollment.profilePhotoPublicId) {
    void deleteCloudinaryImage(enrollment.profilePhotoPublicId);
  }

  await prisma.enrollment.delete({ where: { id: enrollmentId } });

  if (studentAccountRemoved) {
    return {
      success: true,
      message: "Registration and student portal account deleted.",
    };
  }

  return { success: true, message: "Registration deleted." };
}
