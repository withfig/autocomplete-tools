import type { Validator } from "../types";
import type { RunOptions } from "../../types";
import { value, questions } from "./helpers.js";

interface FrameworkValidation {
  framework?: string;
}

export const validateFramework: Validator<FrameworkValidation> = async (options: RunOptions) => {
  const { framework, interactive } = options;
  if (framework || !interactive) return value({ framework });
  return questions({
    type: "text",
    name: "framework",
    message: "What integration was/is being used to generate the spec? (enter to skip)",
  });
};
