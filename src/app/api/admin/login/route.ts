import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, adminSessionCookie } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Password incorrecto." }, { status: 401 });
  }

  const cookie = adminSessionCookie();
  if (!cookie) {
    return NextResponse.json({ error: "Falta configurar ADMIN_PASSWORD en el servidor." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
