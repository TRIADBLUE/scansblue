import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

const STORAGE_DIR = "/tmp/auditor-files";

export interface FileMetadata {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): FileMetadata {
  const id = randomBytes(8).toString("hex");
  const filename = `${id}_${Date.now()}`;
  const filePath = join(STORAGE_DIR, filename);

  writeFileSync(filePath, buffer);

  return {
    id,
    originalName,
    mimeType,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
  };
}

export function getFile(id: string): { buffer: Buffer; metadata: FileMetadata } | null {
  // Find file by ID in storage dir
  const files = require("fs").readdirSync(STORAGE_DIR);
  const matchedFile = files.find((f: string) => f.startsWith(id));

  if (!matchedFile) {
    return null;
  }

  const filePath = join(STORAGE_DIR, matchedFile);
  const buffer = readFileSync(filePath);

  // Parse metadata from filename (format: id_timestamp)
  const [fileId, timestamp] = matchedFile.split("_");

  return {
    buffer,
    metadata: {
      id: fileId,
      originalName: matchedFile,
      mimeType: "application/octet-stream",
      size: buffer.length,
      uploadedAt: new Date(parseInt(timestamp)).toISOString(),
    },
  };
}

export function deleteFile(id: string): boolean {
  try {
    const files = require("fs").readdirSync(STORAGE_DIR);
    const matchedFile = files.find((f: string) => f.startsWith(id));

    if (!matchedFile) {
      return false;
    }

    const filePath = join(STORAGE_DIR, matchedFile);
    require("fs").unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}
