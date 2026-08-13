import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { handlePgError } from "@/lib/api-error";
import type { Shelter } from "@/lib/types";

export async function GET() {
  try {
    const { rows } = await query<Shelter>("select * from shelters order by city asc");
    return NextResponse.json(rows);
  } catch (err) {
    return handlePgError(err);
  }
}
