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
      "Is this spec adding completions to a local script (eg. ./scripts/my-script.sh)",
    choices: [
      { title: "No", value: false, selected: true, description: "(default)" },
      { title: "Yes", value: true },
    ],
  });
};
