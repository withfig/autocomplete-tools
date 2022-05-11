import assert from "assert";
import { Config } from "./types.js";

export function envReplacingCwdValues(env: Config["env"], dir: string) {
  assert(env);
  const newEnv = { ...env };
  for (const key of Object.keys(newEnv) as (keyof typeof newEnv)[]) {
    if (newEnv[key] && newEnv[key] === "__CWD") {
      newEnv[key] = dir;
    }
  }
  return newEnv;
}
