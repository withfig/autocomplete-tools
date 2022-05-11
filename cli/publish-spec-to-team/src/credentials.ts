import os from "os";
import { readFile } from "fs/promises";
import path from "path";
import assert from "assert";
import { ValidationError, ValidationErrorEnum } from "./errors.js";

export async function tryParseTokenFromCredentials(): Promise<string> {
  try {
    const kernel = os.type();
    let config: string;
    const figCredentials = path.join("fig", "credentials.json");
    if (kernel === "Darwin") {
      assert(process.env.HOME);
      config = await readFile(
        path.resolve(process.env.HOME, "Library", "Application Support", figCredentials),
        { encoding: "utf-8" }
      );
    } else if (kernel === "Linux") {
      if (process.env.XDG_DATA_HOME) {
        config = await readFile(path.resolve(process.env.XDG_DATA_HOME, figCredentials), {
          encoding: "utf-8",
        });
      } else {
        assert(process.env.HOME);
        config = await readFile(path.resolve(process.env.HOME, ".local", "share", figCredentials), {
          encoding: "utf-8",
        });
      }
    } else {
      // Windows
      assert(process.env.APPDATA);
      config = await readFile(path.resolve(process.env.APPDATA, figCredentials), {
        encoding: "utf-8",
      });
    }
    /* eslint-disable camelcase */
    const { access_token, id_token } = JSON.parse(config);
    assert(access_token);
    assert(id_token);
    const token = Buffer.from(
      JSON.stringify({ accessToken: access_token, idToken: id_token }),
      "utf-8"
    ).toString("base64");
    return token;
    /* eslint-enable camelcase */
  } catch (error) {
    throw new ValidationError(ValidationErrorEnum.missingToken);
  }
}
