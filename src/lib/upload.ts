import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function uploadDirectory(): string {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    path.join(process.cwd(), "public", "uploads")
  );
}

export function uploadDirectoryPath(): string {
  return uploadDirectory();
}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Formato não permitido. Use JPEG, PNG, WebP ou GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo maior que 5 MB.");
  }

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";

  const name = `${randomUUID()}.${ext}`;
  const dir = uploadDirectory();
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  if (process.env.UPLOAD_DIR) {
    return `/api/files/${name}`;
  }
  return `/uploads/${name}`;
}
