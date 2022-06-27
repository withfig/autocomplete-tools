import type { Validator } from "../types";
import type { RunOptions } from "../../types";
import { value, questions } from "./helpers.js";
import { ValidationError, ValidationErrorEnum } from "../../errors.js";
import { DEFAULT_OPTIONS } from "../../constants.js";

interface SpecDataValidation {
  mode?: "command" | "filepath";
  specPath?: string;
  command?: string;
}

export const validateSpecData: Validator<SpecDataValidation> = async (options: RunOptions) => {
  const { binaryPath, specPath, interactive, framework, subcommandName } = options;
  if (!binaryPath && !specPath) {
    if (interactive) {
      return questions([
        {
          name: "mode",
          message:
            "Do you want to generate the spec now from a command or add a path to a local spec TypeScript file?",
          type: "select",
          choices: [
            {
              title: "I want to generate the spec",
              value: "command",
            },
            {
              title: "I want to specify a path to a file",
              value: "filepath",
            },
          ],
        },
        {
          type: (_, prevValues) => (prevValues.mode === "filepath" ? "text" : null),
          name: "specPath",
          // TODO(fedeci): add TIP about passing this option via the flag and also using interactive mode
          message: "Add the path to a local spec:",
        },
        {
          type: (_, prevValues) => (prevValues.mode === "command" ? "text" : null),
          name: "command",
          message: "Add the path to a local spec:",
        },
      ]);
    }
    throw new ValidationError(ValidationErrorEnum.noSpecPassed);
  }
  if (binaryPath) {
    return value({
      command:
        framework || subcommandName
          ? `${binaryPath} ${subcommandName ?? DEFAULT_OPTIONS.subcommandName}`
          : binaryPath,
      specPath,
    });
  }
  return value({ specPath });
};
