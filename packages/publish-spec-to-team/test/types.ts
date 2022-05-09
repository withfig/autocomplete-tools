import { RunOptions } from "../src";

export interface CheckData extends Record<string, any> {
  files: {
    js: string;
    ts: string;
  };
}

export interface Config {
  options: Omit<RunOptions, "token">;
  checkData: CheckData;
}
