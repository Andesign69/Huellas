import "server-only";
import type { NextRequest } from "next/server";

// Trustworthy only because nginx is the sole thing allowed to reach the app
// (see WBS Chapter 7 — the app must not get a publicly-exposed port of its
// own). Otherwise a client could just set this header itself and spoof any IP.
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  return forwarded.split(",")[0]?.trim() || null;
}
