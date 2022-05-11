import { FormData, Headers } from "node-fetch";
import path from "path";
import esbuild from "esbuild";
import { fetch } from "./node-fetch.js";
import { createFile, exec, validateSpecName, createTempDir, createFileFrom } from "./utils.js";
import { API_BASE } from "./constants.js";
import {
  BuildError,
  GenerationError,
  GenericErrorEnum,
  PublishError,
  ValidationError,
} from "./errors.js";
import { tryParseTokenFromCredentials } from "./credentials.js";
import testHelpers from "./test-helpers.js";

export interface RunOptions {
  name?: string;
  team?: string;
  token?: string;
  specPath?: string;
  binaryPath?: string;
  subcommandName?: string;
  framework?: string;
}

const DEFAULT_OPTION = {
  subcommandName: "generate-fig-spec",
} as const;

export const run = async (options: RunOptions) => {
  const {
    name: optionalName,
    token: optionalToken,
    specPath,
    binaryPath,
    subcommandName,
    framework,
    team,
  } = options;

  let token = optionalToken;
  if (!token) {
    if (process.env.FIG_API_TOKEN) {
      token = process.env.FIG_API_TOKEN;
    } else {
      // try to read the token from the config file
      token = await tryParseTokenFromCredentials();
    }
  }

  let name = optionalName;
  if (!name) {
    // if name is missing we extract it from the optional spec-name
    // NOTE: this won't work correctly for spec names that require being nested under a subfolder
    // e.g. `@withfig/autocomplete-tools.ts`
    if (specPath) {
      name = path.basename(specPath, ".ts");
    } else {
      throw new ValidationError(GenericErrorEnum.missingName);
    }
  }

  validateSpecName(name);

  let specOutput: string | undefined;
  if (binaryPath) {
    const cmd =
      framework || subcommandName
        ? `${binaryPath} ${subcommandName ?? DEFAULT_OPTION.subcommandName}`
        : binaryPath;
    try {
      specOutput = (await exec(cmd)).trim();
    } catch (error) {
      const { message } = error as Error;
      throw new GenerationError(`"${cmd}" exited with errors.\n${message}`);
    }
  }
  const formData = new FormData();

  if (specPath) {
    const tsSpecPath = path.resolve(specPath);
    const [tempDir, removeTempDir] = await createTempDir(path.dirname(tsSpecPath));

    try {
      await esbuild.build({
        entryPoints: {
          [name]: tsSpecPath,
        },
        outdir: tempDir,
        bundle: true,
        format: "esm",
        minify: true,
        logLevel: "silent",
      });

      const jsSpecPath = path.resolve(tempDir, `${name}.js`);
      formData.append("tsSpec", await createFileFrom(tsSpecPath, `${name}.ts`));
      formData.append("jsSpec", await createFileFrom(jsSpecPath, `${name}.js`));
    } catch (error) {
      throw new BuildError((error as Error).message);
    } finally {
      await removeTempDir();
    }
  } else if (specOutput) {
    try {
      const builtSpec = await esbuild.transform(specOutput, {
        format: "esm",
        minify: true,
        logLevel: "silent",
      });
      formData.append("jsSpec", createFile(builtSpec.code, `${name}.js`));
      formData.append("tsSpec", createFile(specOutput, `${name}.ts`));
    } catch (error) {
      throw new BuildError((error as Error).message);
    }
  } else {
    throw new ValidationError(GenericErrorEnum.noSpecPassed);
  }

  formData.append("name", name);
  if (framework) formData.append("framework", framework);
  if (team) formData.append("team", team);

  try {
    await fetch(`${API_BASE}/cdn`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...testHelpers.getAssertDataHeader(),
      },
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    throw new PublishError((error as Error).message);
  }
};
