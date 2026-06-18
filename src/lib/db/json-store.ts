import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filepath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}
