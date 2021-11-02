import { Command } from "commander";
import fs from "fs";
import readline from "readline";
import path from "path";
import chalk from "chalk";

const fileContent = (name: string) => `const completionSpec: Fig.Spec = {
  name: "${name}",
  description: "",
  subcommands: [{
    name: "my_subcommand",
    description: "Example subcommand",
    subcommands: [{
      name: "my_nested_subcommand",
      description: "Nested subcommand, example usage: '${name} my_subcommand my_nested_subcommand'"
    }],
  }],
  options: [{
    name: ["--help", "-h"],
    description: "Show help for ${name}",
  }],
  // Only uncomment if ${name} takes an argument
  // args: {}
};
export default completionSpec;`;

function createSpec(cliName: string) {
  const filePath = path.join(process.cwd(), "src", `${cliName}.ts`);
  const baseName = path.basename(filePath, ".ts");
  const dirName = path.dirname(filePath);
  if (fs.existsSync(filePath)) {
    console.log(
      "\n",
      chalk.red("This completion spec already exists"),
      "\n\n",
      chalk.bold(`Start editing it from the src/${baseName}.ts now!`),
      "\n"
    );
  } else {
    fs.mkdirSync(dirName, { recursive: true });
    fs.writeFileSync(filePath, fileContent(baseName));
    console.log(
      "\n",
      chalk.green(`Successfully created the new Spec ${baseName}`),
      "\n\n",
      `Start editing it at ${chalk.bold(`src/${baseName}.ts`)}!`,
      "\n"
    );
  }
}

function runProgram(cliName: string | undefined) {
  if (!cliName) {
    const rInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rInterface.question(
      "What's the name of the CLI tool you want to create an autocomplete spec for: ",
      async (answer) => {
        createSpec(answer);
      }
    );
  } else {
    createSpec(cliName);
  }
}

const program = new Command("create-spec")
  .description("create spec with given name")
  .arguments("[name]")
  .action(runProgram);
export default program;
