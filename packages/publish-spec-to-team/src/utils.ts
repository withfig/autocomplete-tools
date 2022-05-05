import { exec as execCallback } from "child_process";
import { File } from "node-fetch";
import { ValidationError, ValidationErrorEnum } from "./errors";

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
