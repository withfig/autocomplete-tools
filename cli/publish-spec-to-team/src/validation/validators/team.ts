import type prompts from "prompts";
import type { Validator } from "../types";
import type { RunOptions } from "../../types";
import { value, questions } from "./helpers.js";
import { exec } from "../../utils.js";

interface TeamValidation {
  team?: string;
  teamScopeInfo?: "p" | "t";
}

export const validateTeam: Validator<TeamValidation> = async (options: RunOptions) => {
  const { team, interactive } = options;
  if (team || !interactive) return value({ team });
  try {
    const availableTeams: prompts.Choice[] = (await exec("fig team --list"))
      .trim()
      .split("\n")
      .map((name) => ({
        title: name,
        value: name,
      }));

    return questions([
      {
        type: "select",
        message: "Would you like to publish the spec:",
        choices: [
          {
            title: "For personal use",
            value: "p",
          },
          {
            title: "For a team",
            value: "t",
          },
        ],
        name: "teamScopeInfo",
      },
      {
        type: (prev: string) => (prev === "t" ? "select" : false),
        message: "Choose a team to publish the spec to:",
        name: "team",
        choices: availableTeams,
      },
    ]);
  } catch {
    return value({ team: "" });
  }
};
