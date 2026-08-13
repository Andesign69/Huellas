import "server-only";
import path from "node:path";
import { mkdir } from "node:fs/promises";

// Prod/staging (WBS Chapter 7): /srv/huellas/uploads/{prod,staging}, served
// directly by nginx. Local dev: a gitignored folder in the repo, served by
// src/app/photos/[...path]/route.ts since there's no nginx here.
//
// turbopackIgnore: this path is always an external directory mounted at
// runtime, never something inside the app bundle — nothing here for
// Turbopack to trace. Without the ignore, the build defensively packs the
// entire project "just in case" (a real warning, confirmed during WBS
// Chapter 7's build).
export const UPLOADS_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOADS_DIR || "./.data/uploads");

export async function ensureUploadsDir() {
  await mkdir(UPLOADS_DIR, { recursive: true });
}
