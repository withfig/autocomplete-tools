import fs from "fs";
import { Command, Option } from "commander";
import merge from "../merge";
import { presets } from "../merge/presets";

function runProgram(program: Command) {
  program.parse();
  const { ignoreProps = [], newFile: updatedSpecPath, preset } = program.opts();
  const [oldSpecPath, newSpecPath] = program.args;

  const output = merge(
    fs.readFileSync(oldSpecPath, { encoding: "utf8" }),
    fs.readFileSync(newSpecPath, { encoding: "utf8" }),
    { ignoreProps, preset }
  );

  fs.writeFileSync(updatedSpecPath || oldSpecPath, output);
}

const program = new Command();
program.arguments("<oldspec> <newspec>");
program.option("-n, --new-file <path>", "Create a new spec file instead of updating the old one");
program.option("-i, --ignore-props <props>", "The props that should not be preserved.", (value) =>
  value.split(",")
);
const presetOption = new Option("-p, --preset <name>", "Use a preset").choices(
  Object.keys(presets)
);
program.addOption(presetOption);

runProgram(program);
