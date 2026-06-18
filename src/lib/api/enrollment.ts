import { promises as fs } from "fs";
import path from "path";
import type { EnrollmentPayload } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const ENROLLMENT_FILE = path.join(DATA_DIR, "enrollments.json");

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createApiResponse<T>(
  success: boolean,
  options: { data?: T; error?: string; message?: string } = {}
): ApiResponse<T> {
  return { success, ...options };
}

async function ensureDataDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function savePaymentScreenshot(
  id: string,
  file: File
): Promise<string> {
  await ensureDataDir();
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = ext.replace(/[^.a-zA-Z0-9]/g, "").slice(0, 10) || ".jpg";
  const filename = `${id}${safeExt}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  return `uploads/${filename}`;
}

export async function saveEnrollment(
  enrollment: EnrollmentPayload & { id: string; createdAt: string }
): Promise<void> {
  await ensureDataDir();

  let enrollments: (EnrollmentPayload & { id: string; createdAt: string })[] = [];

  try {
    const data = await fs.readFile(ENROLLMENT_FILE, "utf-8");
    enrollments = JSON.parse(data);
  } catch {
    enrollments = [];
  }

  enrollments.push(enrollment);
  await fs.writeFile(ENROLLMENT_FILE, JSON.stringify(enrollments, null, 2));
}

export async function getEnrollments(): Promise<
  (EnrollmentPayload & { id: string; createdAt: string })[]
> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(ENROLLMENT_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}
