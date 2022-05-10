import { RunOptions } from "../src";

export interface AssertFileData {
  name?: string
  content?: string
}

export interface AssertRequest extends Record<string, any> {
  files?: {
    jsSpec?: AssertFileData;
    tsSpec?: AssertFileData;
  };
}

export interface Config {
  options: Omit<RunOptions, "token">;
  assert: AssertRequest;
}
