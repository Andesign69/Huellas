import { NextResponse } from "next/server";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { UPLOADS_DIR } from "@/lib/uploads";

// Local-dev-only stand-in for nginx, which serves this same /photos/ path
// directly from disk in prod/staging (WBS Chapter 7) — this route exists so
// uploaded photos are viewable without needing nginx installed locally.
// Filenames are always <uuid>.<ext> (see /api/upload), so anything else is
// rejected outright rather than attempting to sanitize arbitrary input.
const SAFE_FILENAME = /^[a-f0-9-]+\.(jpg|png|webp)$/i;
const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.length !== 1 || !SAFE_FILENAME.test(segments[0])) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = segments[0];
  const filePath = path.join(UPLOADS_DIR, filename);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filename).slice(1).toLowerCase();
  const buffer = await readFile(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
