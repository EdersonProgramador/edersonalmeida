import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }
    const url = await saveUploadedImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha no upload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
