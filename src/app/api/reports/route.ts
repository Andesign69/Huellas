import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import { getClientIp } from "@/lib/request-ip";
import type { PetReport } from "@/lib/types";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 100) : null;

  try {
    const { rows } = await query<PetReport>(
      limit
        ? "select * from reports where resolved = false order by created_at desc limit $1"
        : "select * from reports where resolved = false order by created_at desc",
      limit ? [limit] : []
    );
    return NextResponse.json(rows);
  } catch (err) {
    return handlePgError(err);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { name, species, breed, sex, status, photo_url, lat, lng, city, description, contact, honeypot, form_loaded_at } =
    body ?? {};

  if (!species || !status || typeof lat !== "number" || typeof lng !== "number" || !city || !contact) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  try {
    const { rows } = await query<{ id: string; resolve_token: string }>(
      "select * from submit_report($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
      [
        name ?? null,
        species,
        breed ?? null,
        sex ?? null,
        status,
        photo_url ?? null,
        lat,
        lng,
        city,
        description ?? null,
        contact,
        honeypot ?? null,
        form_loaded_at ?? null,
        getClientIp(request),
      ]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    return handlePgError(err);
  }
}
