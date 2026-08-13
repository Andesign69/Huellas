import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import { getClientIp } from "@/lib/request-ip";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { name, city, contact, website, notes, honeypot, form_loaded_at } = body ?? {};

  if (!name || !city || !contact) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  try {
    await query("select suggest_shelter($1,$2,$3,$4,$5,$6,$7,$8)", [
      name,
      city,
      contact,
      website ?? null,
      notes ?? null,
      honeypot ?? null,
      form_loaded_at ?? null,
      getClientIp(request),
    ]);
    return NextResponse.json({ suggested: true }, { status: 201 });
  } catch (err) {
    return handlePgError(err);
  }
}
