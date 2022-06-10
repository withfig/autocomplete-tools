import { FormData } from "node-fetch";
import path from "path";
import esbuild from "esbuild";
import { fetch } from "./node-fetch.js";
import { createFile, exec, createTempDir, createFileFrom } from "./utils.js";
import { API_BASE, DEFAULT_OPTIONS } from "./constants.js";
import {
  BuildError,
  GenerationError,
  GenericErrorEnum,
  PublishError,
  ValidationError,
} from "./errors.js";
import testHelpers from "./test-helpers.js";
import type { RunOptions } from "./types.js";
import {
  validateToken,
  validateName,
  validateTeam,
  validateSpecData,
  validate,
  validateFramework,
  validateRest,
} from "./validation/index.js";
import type { Validator } from "./validation/types";

export const run = async (options: RunOptions) => {
  const { token, name, team, framework, specPath, command, isScript } = await validate(options)
    .validator(validateToken)
    .validator(validateName)
    .validator(validateTeam)
    .validator(validateFramework)
    .validator(validateSpecData)
    .validator(validateRest)
    .exec();

  let specOutput: string | undefined;
  if (command) {
    try {
      specOutput = (await exec(command)).trim();
    } catch (error) {
      const { message } = error as Error;
      throw new GenerationError(`"${command}" exited with errors.\n${message}`);
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
    throw new ValidationError(GenericErrorEnum.noSpecDataReceived);
  }

  formData.append("name", name);
  if (framework) formData.append("framework", framework);
  if (team) formData.append("team", team);
  if (isScript) formData.append("isScript", "true");

  try {
    // This fetch method is a wrapper over the node-fetch function
    // See node-fetch.ts
    const response = await fetch(`${API_BASE}/completions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...testHelpers.getAssertDataHeader(),
      },
      method: "PUT",
      body: formData,
    });

    try {
      const { namespace, name: specName } = (await response.json()) as {
        namespace: string;
        name: string;
      };
      console.log(`Successfully published ${specName} to ${namespace}`);
    } catch (error) {
      console.log("The spec was successfully published.");
    }
  } catch (error) {
    throw new PublishError((error as Error).message);
  }
};
