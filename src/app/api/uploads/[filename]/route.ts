import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filepath = path.join(process.cwd(), "data", "uploads", safeName);

  try {
    const buffer = await fs.readFile(filepath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
