import fetch, { FormData, fileFrom } from "node-fetch";
import path from "path";
import esbuild from "esbuild";
import { createFile, exec, validateSpecName } from "./utils.js";
import { API_BASE, cleanTempDir, tempDir } from "./constants.js";
import { BuildError, GenericErrorEnum, PublishError, ValidationError } from "./errors.js";

export interface RunOptions {
  name?: string;
  team?: string;
  token: string;
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
    token,
    specPath,
    binaryPath,
    subcommandName,
    framework,
    team,
  } = options;

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
      throw new ValidationError(`${cmd} exited with errors.\n${(error as Error).message}`);
    }
  }
  const formData = new FormData();

  if (specPath) {
    const tsSpecPath = path.resolve(specPath);
    const tmpDir = await tempDir();

    try {
      await esbuild.build({
        entryPoints: {
          [name]: tsSpecPath,
        },
        outdir: tmpDir,
        bundle: true,
        format: "esm",
        minify: true,
      });
      formData.append("tsSpec", await fileFrom(tsSpecPath));
      formData.append("jsSpec", await fileFrom(path.resolve(tmpDir, `${name}.js`)));
    } catch (error) {
      throw new BuildError((error as Error).message);
    }
  } else if (specOutput) {
    try {
      const builtSpec = await esbuild.transform(specOutput, {
        format: "esm",
        minify: true,
      });
      formData.append("jsSpec", createFile(builtSpec.code, `${name}.js`));
      formData.append("tsSpec", createFile(specOutput, `${name}.js`));
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
      },
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    throw new PublishError((error as Error).message);
  }
  await cleanTempDir();
};
