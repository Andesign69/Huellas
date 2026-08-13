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
    await query("select admin_dismiss_flag($1)", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handlePgError(err);
  }
}
