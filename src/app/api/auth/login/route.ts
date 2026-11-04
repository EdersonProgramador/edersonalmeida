import { NextResponse } from "next/server";
import { getSession, verifyCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.email = email;
  await session.save();

  return NextResponse.json({ ok: true });
}
