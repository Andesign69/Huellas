import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR, ensureUploadsDir } from "@/lib/uploads";
import { sniffImage } from "@/lib/sniff-image";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado grande (máximo 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImage(buffer);
  if (!sniffed) {
    return NextResponse.json({ error: "Formato de imagen no soportado." }, { status: 400 });
  }

  await ensureUploadsDir();
  const filename = `${randomUUID()}.${sniffed.ext}`;
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ url: `/photos/${filename}` }, { status: 201 });
}
