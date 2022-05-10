import { Command } from "commander";
import path from "path";
import { createBoilerplateFolder } from "./create-boilerplate";
import { createCompletionSpec } from "./create-spec";

interface Options {
  here?: boolean;
}

async function runProgram(specName: string, options: Options) {
  const { here } = options;
  if (!here) {
    createBoilerplateFolder();
    console.log("----");
  }
  createCompletionSpec(
    specName,
    here ? process.cwd() : path.resolve(process.cwd(), ".fig", "autocomplete", "src")
  );
}

export const program = new Command("create-completion-spec")
  .description("Setup fig folder and create spec with the given name")
  .arguments("<name>")
  .option("-h, --here", "Set if the spec should be created in the current folder")
  .action(runProgram);
