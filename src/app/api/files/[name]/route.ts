import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { uploadDirectoryPath } from "@/lib/upload";

type Props = { params: Promise<{ name: string }> };

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: Props) {
  const { name } = await params;
  if (!name || name.includes("..") || name.includes("/")) {
    return NextResponse.json({ error: "Inválido" }, { status: 400 });
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const filePath = path.join(uploadDirectoryPath(), name);

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
