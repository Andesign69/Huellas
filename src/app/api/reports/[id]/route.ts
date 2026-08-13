import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import type { PetReport } from "@/lib/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { rows } = await query<PetReport>("select * from reports where id = $1", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Este reporte ya no existe." }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    return handlePgError(err);
  }
}
