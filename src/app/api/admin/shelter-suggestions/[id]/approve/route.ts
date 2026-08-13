import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import { hasAdminSession } from "@/lib/adminAuth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { rows } = await query<{ admin_approve_shelter_suggestion: string }>(
      "select admin_approve_shelter_suggestion($1)",
      [id]
    );
    return NextResponse.json({ ok: true, shelterId: rows[0]?.admin_approve_shelter_suggestion });
  } catch (err) {
    return handlePgError(err);
  }
}
