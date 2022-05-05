import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";

export const API_BASE = process.env.BASE_URL || "https://node-backend-mkoj.onrender.com";

// * TEMP DIR
const TEMP_DIR = path.resolve(randomUUID());

let existenceChecked = true;
export async function tempDir() {
  if (!existenceChecked && !existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR);
  }
  existenceChecked = true;
  return TEMP_DIR;
}

export async function cleanTempDir() {
  if (existsSync(TEMP_DIR)) {
    await rm(TEMP_DIR, { recursive: true });
  }
}
