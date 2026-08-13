import "server-only";
import path from "node:path";
import { mkdir } from "node:fs/promises";

// Prod/staging (WBS Chapter 7): /srv/huellas/uploads/{prod,staging}, served
// directly by nginx. Local dev: a gitignored folder in the repo, served by
// src/app/photos/[...path]/route.ts since there's no nginx here.
export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || "./.data/uploads");

export async function ensureUploadsDir() {
  await mkdir(UPLOADS_DIR, { recursive: true });
}
