import fs from "fs";
import { Command, Option } from "commander";
import merge from "../merge";
import { presets } from "../merge/presets";

function runProgram(program: Command) {
  program.parse();
  const {
    ignoreProps = [],
    ignoreCommandProps = [],
    ignoreOptionProps = [],
    ignoreArgProps = [],
    newFile: updatedSpecPath,
    preset,
  } = program.opts();
  const [oldSpecPath, newSpecPath] = program.args;

  const output = merge(
    fs.readFileSync(oldSpecPath, { encoding: "utf8" }),
    fs.readFileSync(newSpecPath, { encoding: "utf8" }),
    {
      preset,
      ignore: {
        commonProps: ignoreProps,
        commandProps: ignoreCommandProps,
        optionProps: ignoreOptionProps,
        argProps: ignoreArgProps,
      },
    }
  );

  fs.writeFileSync(updatedSpecPath || oldSpecPath, output);
}

const program = new Command();
program.arguments("<oldspec> <newspec>");
program.option("-n, --new-file <path>", "Create a new spec file instead of updating the old one");
program.option(
  "-i, --ignore-props <props>",
  "The props that should always be overridden.",
  (value) => value.split(",")
);
program.option(
  "--ignore-command-props <props>",
  "The command props that should always be overridden.",
  (value) => value.split(",")
);
program.option(
  "--ignore-option-props <props>",
  "The option props that should always be overridden.",
  (value) => value.split(",")
);
program.option(
  "--ignore-arg-props <props>",
  "The arg props that should always be overridden.",
  (value) => value.split(",")
);
const presetOption = new Option("-p, --preset <name>", "Use a preset").choices(
  Object.keys(presets)
);
program.addOption(presetOption);

runProgram(program);
