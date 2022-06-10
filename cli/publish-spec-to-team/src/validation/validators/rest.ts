import { value } from "./helpers.js";
import type { RunOptions } from "../../types";
import type { Validator } from "../types";

interface RestValidation {
  isScript: boolean;
}

export const validateRest: Validator<RestValidation> = async (options: RunOptions) => {
  const { isScript } = options;
  return value({ isScript: Boolean(isScript) });
};
