import { execFileSync } from "node:child_process";

export function commandStatus(command: string, args: string[]): boolean {
  try {
    execFileSync(command, args);
    return true;
  } catch {
    return false;
  }
}

let IS_FIG_INSTALLED: boolean | undefined;
export function isFigInstalled(): boolean {
  if (IS_FIG_INSTALLED === undefined) {
    IS_FIG_INSTALLED = commandStatus("fig", ["--version"]);
  }
  return IS_FIG_INSTALLED;
}

let IS_CW_INSTALLED: boolean | undefined;
export function isCwInstalled(): boolean {
  if (IS_CW_INSTALLED === undefined) {
    IS_CW_INSTALLED = commandStatus("cw", ["--version"]);
  }
  return IS_CW_INSTALLED;
}

export function setSetting(key: string, value: unknown) {
  if (isFigInstalled()) {
    commandStatus("fig", ["settings", key, JSON.stringify(value)]);
  }
  if (isCwInstalled()) {
    commandStatus("cw", ["settings", key, JSON.stringify(value)]);
  }
}
