import fs from "fs";
import { Command } from "commander";
import merge from "../merge";

function runProgram(program: Command) {
  program.parse();
  const { ignoreProps = [] } = program.opts();
  const [oldSpecPath, newSpecPath, updatedSpecPath] = program.args;

  const output = merge(
    fs.readFileSync(oldSpecPath, { encoding: "utf8" }),
    fs.readFileSync(newSpecPath, { encoding: "utf8" }),
    { ignoreProps }
  );

  fs.writeFileSync(updatedSpecPath || oldSpecPath, output);
}

const program = new Command();
program.arguments("<oldspec> <newspec> [updatedspec]");
program.option("-i, --ignore-props <props>", "The props that should not be preserved.", (value) =>
  value.split(",")
);

runProgram(program);
