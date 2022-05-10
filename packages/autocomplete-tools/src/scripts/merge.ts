import fs from "fs";
import { Command, Option } from "commander";
import { merge, presets } from "@fig/autocomplete-merge";

function runProgram(oldSpecPath: string, newSpecPath: string, options: Record<string, any>) {
  const {
    ignoreProps = [],
    ignoreCommandProps = [],
    ignoreOptionProps = [],
    ignoreArgProps = [],
    newFile: updatedSpecPath,
    preset,
  } = options;

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

const program = new Command("merge")
  .arguments("<oldspec> <newspec>")
  .description("deep merge new spec into old spec")
  .option("-n, --new-file <path>", "Create a new spec file instead of updating the old one")
  .option("-i, --ignore-props <props>", "The props that should always be overridden.", (value) =>
    value.split(",")
  )
  .option(
    "--ignore-command-props <props>",
    "The command props that should always be overridden.",
    (value) => value.split(",")
  )
  .option(
    "--ignore-option-props <props>",
    "The option props that should always be overridden.",
    (value) => value.split(",")
  )
  .option(
    "--ignore-arg-props <props>",
    "The arg props that should always be overridden.",
    (value) => value.split(",")
  );

const presetOption = new Option("-p, --preset <name>", "Use a preset").choices(
  Object.keys(presets)
);
program.addOption(presetOption);
program.action(runProgram);

export default program;
