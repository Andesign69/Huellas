import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { token } = body ?? {};
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  }

  try {
    const { rows } = await query<{ resolve_report: boolean }>("select resolve_report($1, $2)", [id, token]);
    return NextResponse.json({ resolved: rows[0]?.resolve_report === true });
  } catch (err) {
    return handlePgError(err);
  }
}
