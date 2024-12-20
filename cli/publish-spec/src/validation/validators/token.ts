import { tryParseTokenFromCredentials } from "../../credentials.js";
import type { Validator } from "../types";
import type { RunOptions } from "../../types";
import { value, questions } from "./helpers.js";

interface TokenValidation {
  token: string;
}

export const validateToken: Validator<TokenValidation> = async (options: RunOptions) => {
  const { token, interactive } = options;
  if (token) return value({ token });
  if (process.env.FIG_API_TOKEN) return value({ token: process.env.FIG_API_TOKEN });
  // try to read the token from the config file
  try {
    return value({ token: await tryParseTokenFromCredentials() });
  } catch (error) {
    if (!interactive) throw error;
    return questions({
      type: "password",
      message:
        "A Fig API token to push a spec to a team but none was found, please insert one manually:",
      name: "token",
      validate: (v: string) => !!v || "A Token is required to push the spec to a team",
    });
  }
};
