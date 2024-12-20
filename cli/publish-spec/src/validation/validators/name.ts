import path from "path";
import { ValidationError, GenericErrorEnum, ValidationErrorEnum } from "../../errors.js";
import { validateSpecName } from "../../utils.js";
import { value, questions } from "./helpers.js";
import type { RunOptions } from "../../types";
import type { Validator } from "../types";

interface NameValidation {
  name: string;
}

export const validateName: Validator<NameValidation> = async (options: RunOptions) => {
  const { name: optionalName, specPath, interactive } = options;
  let name = optionalName;
  try {
    if (!name) {
      if (specPath) {
        // if name is missing we extract it from the optional spec-name
        // NOTE: this won't work correctly for spec names that require being nested under a subfolder
        // e.g. `@withfig/autocomplete-tools.ts`
        name = path.basename(specPath, ".ts");
      } else {
        throw new ValidationError(GenericErrorEnum.missingName);
      }
    }
    validateSpecName(name);
    return value({ name });
  } catch (error) {
    if (!interactive) throw error;
    return questions({
      type: "text",
      message: "Choose a name for the spec:",
      name: "name",
      validate: (v: string) => !v.includes(" ") || ValidationErrorEnum.nameWithSpace,
    });
  }
};
