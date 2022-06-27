import { questions, value } from "./helpers.js";
import type { RunOptions } from "../../types";
import type { Validator } from "../types";

interface RestValidation {
  isScript: boolean;
}

export const validateIsScript: Validator<RestValidation> = async (options: RunOptions) => {
  const { isScript, interactive } = options;
  if (isScript || !interactive) return value({ isScript: Boolean(isScript) });
  return questions({
    type: "select",
    name: "isScript",
    message:
      "Is the spec a local script that will only be loaded when referenced in a fig/config.json file?",
    choices: [
      { title: "No", value: false, selected: true, description: "(default)" },
      { title: "Yes", value: true },
    ],
  });
};
