import "server-only";
import { NextResponse } from "next/server";

// submit_report()/resolve_report()/flag_report()/suggest_shelter() rechazan
// vía `raise exception '<mensaje en español>'`, que Postgres marca con el
// SQLSTATE por defecto P0001. Ese texto ya está pensado para mostrarse tal
// cual en la UI (así lo hacía el cliente con rpcError.message contra
// Supabase) — lo distinguimos de una falla real de infraestructura (Postgres
// caído, timeout, columna que ya no existe...), donde el mensaje de pg puede
// traer detalles internos que no queremos mostrar, así que ahí se loguea
// server-side y se devuelve algo genérico.
export function handlePgError(err: unknown) {
  const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;

  if (code === "P0001" && err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.error(err);
  return NextResponse.json({ error: "Error del servidor. Intenta de nuevo en un momento." }, { status: 500 });
}
