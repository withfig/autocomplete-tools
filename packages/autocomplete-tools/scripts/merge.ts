import fs from "fs";
import { Command } from "commander";
import merge from "../merge";

function runProgram(program: Command) {
  program.parse();
  const { ignoreProps = [], new: updatedSpecPath } = program.opts();
  const [oldSpecPath, newSpecPath] = program.args;

  const output = merge(
    fs.readFileSync(oldSpecPath, { encoding: "utf8" }),
    fs.readFileSync(newSpecPath, { encoding: "utf8" }),
    { ignoreProps }
  );

  fs.writeFileSync(updatedSpecPath || oldSpecPath, output);
}

const program = new Command();
program.arguments("<oldspec> <newspec>");
program.option("-n, --new <path>", "Create a new spec file instead of updating the old one");
program.option("-i, --ignore-props <props>", "The props that should not be preserved.", (value) =>
  value.split(",")
);

runProgram(program);
