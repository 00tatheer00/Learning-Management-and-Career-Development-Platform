import type { EnrollmentPayload } from "@/types";

export type UserRole = "student" | "trainer" | "admin";
export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  programSlug?: string;
  level?: string;
  batch?: string;
  trainerId?: string;
  avatarInitials?: string;
  avatarUrl?: string;
  designation?: string;
  bio?: string;
  experience?: string;
  expertise?: string[];
  imagePosition?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
}

export interface EnrollmentRecord extends EnrollmentPayload {
  id: string;
  createdAt: string;
  status: EnrollmentStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
}

export interface CourseMaterial {
  id: string;
  programSlug: string;
  title: string;
  description: string;
  type: "video" | "link" | "document";
  url: string;
  order: number;
}

export interface Assignment {
  id: string;
  programSlug: string;
  title: string;
  description: string;
  dueDate: string;
  trainerId: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  status: "submitted" | "approved" | "needs_revision";
  submittedAt: string;
  feedback?: string;
  reviewedAt?: string;
}

export interface LiveSession {
  id: string;
  programSlug: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  roomType: "meet" | "portal";
  roomName?: string;
  roomPassword?: string;
  trainerId: string;
  trainerName: string;
  notes?: string;
}

export type LiveSessionPublic = Omit<LiveSession, "roomPassword">;

export interface PortalUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  programSlug?: string;
  level?: string;
  batch?: string;
  trainerId?: string;
  avatarInitials?: string;
  avatarUrl?: string;
}
