import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import { getClientIp } from "@/lib/request-ip";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { reason, honeypot, form_loaded_at } = body ?? {};

  try {
    await query("select flag_report($1,$2,$3,$4,$5)", [
      id,
      reason ?? null,
      honeypot ?? null,
      form_loaded_at ?? null,
      getClientIp(request),
    ]);
    return NextResponse.json({ flagged: true }, { status: 201 });
  } catch (err) {
    return handlePgError(err);
  }
}
