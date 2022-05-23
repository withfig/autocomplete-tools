import { createCompletionSpec } from "create-completion-spec";
import { Command } from "commander";
import readline from "readline";
import path from "path";

const program = new Command("create-spec")
  .description("create spec with given name")
  .arguments("[name]")
  .action((specName) => {
    const autocompleteFolder = path.resolve(process.cwd(), "src");
    if (!specName) {
      const rInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rInterface.question(
        "What's the name of the CLI tool you want to create an autocomplete spec for: ",
        async (answer) => {
          createCompletionSpec(answer, autocompleteFolder);
          rInterface.close();
        }
      );
    } else {
      createCompletionSpec(specName, autocompleteFolder);
    }
  });

export default program;
