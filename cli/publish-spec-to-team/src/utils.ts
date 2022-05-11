import { randomUUID } from "crypto";
import fs from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { exec as execCallback } from "child_process";
import { File, Blob } from "node-fetch";
import { ValidationError, ValidationErrorEnum } from "./errors.js";

export async function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execCallback(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

export function validateSpecName(name: string) {
  if (name.includes(" ")) {
    throw new ValidationError(ValidationErrorEnum.nameWithSpace);
  }
}

export function createFile(content: string, name: string) {
  const blob = new Blob([content]);
  return new File([blob], name);
}

export async function createFileFrom(filePath: string, name: string) {
  return new Promise<File>((resolve, reject) => {
    const bytes: BlobPart[] = [];
    fs.createReadStream(filePath)
      .on("data", (byte) => bytes.push(byte))
      .once("end", () => {
        const blob = new Blob(bytes);
        resolve(new File([blob], name));
      })
      .once("error", reject);
  });
}

type CreateTempDirResult = [tempDirPath: string, cleanTempDirFn: () => Promise<void>];

export async function createTempDir(rootDir: string): Promise<CreateTempDirResult> {
  const dir = path.resolve(rootDir, randomUUID());
  if (!fs.existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const removeFn = async () => {
    if (fs.existsSync(dir)) {
      await rm(dir, { recursive: true });
    }
  };
  return [dir, removeFn];
}
