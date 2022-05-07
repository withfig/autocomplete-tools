import { Command } from "commander";
import fetch, { fileFrom, FormData } from "node-fetch";
import path from "path";
import esbuild from "esbuild";
import { createFile, exec, validateSpecName } from "./utils";
import { API_BASE, cleanTempDir, tempDir } from "./constants";
// @ts-ignore package.json is always in '../' as long as we build src/ to lib/
import packageJSON from "../package.json";
import { BuildError, GenericErrorEnum, PublishError, ValidationError } from "./errors";

export interface RunOptions {
  name?: string;
  namespace?: string;
  token: string;
  specPath?: string;
  binaryPath?: string;
  subcommandName?: string;
  framework?: string;
}

const program = new Command()
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description("Publish a spec to fig teams");

program
  .requiredOption("-t, --token <string>", "A fig token")
  .option("-c, --namespace", "Set the namespace of the published spec")
  .option("-n, --name <string>", "Set the name of the published spec")
  .option("-p, --spec-path <path>", "The local path of the spec to publish")
  .option("-b, --binary-path <path>", "The path of the binary to run to generate the spec")
  .option(
    "-s, --subcommand-name <string>",
    "The subcommand of the binary used to generate the spec",
    "generate-fig-spec"
  )
  .option("-f, --framework <string>", "Framework used to build the CLI");

export const run = async (options: RunOptions) => {
  const {
    name: optionalName,
    token,
    specPath,
    binaryPath,
    subcommandName,
    framework,
    namespace,
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
    const cmd = !subcommandName ? `${binaryPath} ${subcommandName}` : binaryPath;
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
  if (namespace) formData.append("namespace", namespace);

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

program.action(run);

program.parse(process.argv);
