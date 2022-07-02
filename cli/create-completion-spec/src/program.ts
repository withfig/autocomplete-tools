import { Command } from "commander";
import path from "path";
import pc from "picocolors";
import { createBoilerplateFolder } from "./create-boilerplate";
import { createCompletionSpec } from "./create-spec";

interface Options {
  here?: boolean;
}

async function runProgram(specName: string, options: Options) {
  const { here } = options;
  try {
    if (!here) {
      createBoilerplateFolder();
      console.log("----");
    }
    createCompletionSpec(
      specName,
      here ? process.cwd() : path.resolve(process.cwd(), ".fig", "autocomplete", "src")
    );
  } catch (error) {
    console.log(pc.red((error as Error).message));
    process.exit(1);
  }
}

export const program = new Command("create-completion-spec")
  .description("Setup fig folder and create spec with the given name")
  .arguments("<name>")
  .option("--here", "Set if the spec should be created in the current folder")
  .action(runProgram);
