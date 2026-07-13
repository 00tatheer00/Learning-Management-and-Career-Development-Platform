import {
  getEnrollmentById,
  updateEnrollmentStatus,
} from "@/lib/api/portal-data";
import {
  createUserWithPasswordHash,
  getUserByEmail,
  updateUser,
} from "@/lib/auth/users";
import { buildStudentProgramAssignment } from "@/lib/auth/program-assignment";
import { resolveActiveStudentModule } from "@/lib/modules/student-module-access";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import { hashPassword } from "@/lib/auth/password";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { issueEnrollmentLoginPassword } from "@/lib/auth/student-login-password";
import { sendApprovalWelcomeNotifications } from "@/lib/notifications/approval-welcome";
import { sendRejectionNotifications } from "@/lib/notifications/rejection-notice";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getPortalLoginUrl } from "@/lib/site-url";
import type { EnrollmentRecord } from "@/types/portal";

export async function approveEnrollmentAndCreateAccount(
  enrollmentId: string,
  adminUserId: string,
  adminNotes?: string
): Promise<{
  enrollment: EnrollmentRecord | null;
  message: string;
  error?: string;
  credentials?: { loginId: string; password: string; loginUrl: string };
  studentId?: string;
  emailSent?: boolean;
  emailError?: string;
  whatsappSent?: boolean;
  whatsappError?: string;
  passwordSaved?: boolean;
}> {
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

  const user = await getUserByEmail(enrollment.email);
  const plainPassword = generateStudentPassword();

  const avatarInitials = enrollment.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const assignment = await buildStudentProgramAssignment(
    enrollment.program,
    enrollment.level,
    enrollment.batch
  );

  const approvedLevels = await getApprovedEnrollmentLevels(
    enrollment.email,
    enrollment.program
  );
  const activeLevel =
    resolveActiveStudentModule(enrollment.program, enrollment.level, approvedLevels) ??
    assignment.level;

  if (!user) {
    await createUserWithPasswordHash({
      email: enrollment.email,
      passwordHash: await hashPassword(plainPassword),
      role: "student",
      name: enrollment.fullName,
      phone: enrollment.whatsapp,
      programSlug: assignment.programSlug,
      level: activeLevel,
      batch: assignment.batch,
      trainerId: assignment.trainerId,
      isActive: true,
      avatarInitials,
    });
  } else {
    await updateUser(user.id, {
      name: enrollment.fullName,
      phone: enrollment.whatsapp,
      programSlug: assignment.programSlug,
      level: activeLevel,
      batch: assignment.batch,
      trainerId: assignment.trainerId,
      isActive: true,
      avatarInitials,
    });
  }

  const student = await getUserByEmail(enrollment.email);
  if (!student) {
    return { enrollment, message: "Registration approved but student account missing.", error: "Student account missing" };
  }

  const passwordIssue = await issueEnrollmentLoginPassword({
    studentId: student.id,
    enrollmentId,
    plainPassword,
    syncAccountHash: true,
  });
  const passwordSaved = passwordIssue.ok;
  if (!passwordSaved) {
    console.warn(
      "Approval succeeded but portal password was not verified:",
      passwordIssue.error ?? "unknown error"
    );
  }

  const notifications = await sendApprovalWelcomeNotifications({
    fullName: enrollmentRecord.fullName,
    email: enrollmentRecord.email,
    whatsapp: enrollmentRecord.whatsapp,
    program: enrollmentRecord.program,
    level: enrollmentRecord.level,
    password: plainPassword,
  });

  const emailError = notifications.emailSent
    ? null
    : (notifications.warnings.find((w) => w.toLowerCase().includes("email")) ??
        notifications.warnings[0] ??
        "Approval email not sent");

  const whatsappWarning = notifications.warnings.find((w) =>
    w.toLowerCase().includes("whatsapp") ||
    w.toLowerCase().includes("template") ||
    w.toLowerCase().includes("token") ||
    w.toLowerCase().includes("meta") ||
    w.toLowerCase().includes("graph")
  ) ?? notifications.warnings.find((w) => !w.toLowerCase().includes("email"));

  const whatsappError = notifications.whatsappSent
    ? null
    : (whatsappWarning ?? "WhatsApp info message not sent");

  if (!notifications.whatsappSent) {
    console.error(
      "[approval] WhatsApp send failed for enrollment",
      enrollmentId,
      "| warnings:",
      notifications.warnings
    );
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      approvalEmailSent: notifications.emailSent,
      approvalEmailError: emailError,
      approvalWhatsAppSent: notifications.whatsappSent,
      approvalWhatsAppError: whatsappError,
    },
  });

  const parts: string[] = ["Registration approved. Module login saved."];
  if (notifications.emailSent) parts.push("Email sent.");
  else parts.push(`Email failed: ${notifications.warnings.find((w) => w.toLowerCase().includes("email")) ?? "not sent"}`);
  if (notifications.whatsappSent) parts.push("WhatsApp sent.");
  else if (whatsappError) parts.push(`WhatsApp failed: ${whatsappError}`);

  const message = parts.join(" ");

  return {
    enrollment,
    message,
    studentId: student?.id,
    emailSent: notifications.emailSent,
    emailError: emailError ?? undefined,
    whatsappSent: notifications.whatsappSent,
    whatsappError: whatsappError ?? undefined,
    passwordSaved,
    credentials: {
      loginId: enrollment.email,
      password: plainPassword,
      loginUrl: getPortalLoginUrl(),
    },
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

  void sendRejectionNotifications({
    fullName: enrollment.fullName,
    email: enrollment.email,
    whatsapp: enrollment.whatsapp,
    program: enrollment.program,
    level: enrollment.level,
    reason: adminNotes,
  }).catch((error) => {
    console.error("Background rejection notifications failed:", error);
  });

  return {
    enrollment,
    message: "Registration rejected. Student will be notified on WhatsApp.",
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
    const otherApprovedCount = await prisma.enrollment.count({
      where: {
        email: enrollment.email.toLowerCase(),
        status: "approved",
        id: { not: enrollmentId },
      },
    });

    const student = await getUserByEmail(enrollment.email);
    if (student?.role === "student" && otherApprovedCount === 0) {
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
