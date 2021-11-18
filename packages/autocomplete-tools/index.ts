#!/usr/bin/env node
import { Command } from "commander";
import merge from "./scripts/merge";
import dev from "./scripts/dev";
import createSpec from "./scripts/create-spec";
import compile from "./scripts/compile";
import init from "./scripts/init";

const program = new Command();

program
  .name("@withfig/autocomplete-tools")
  .description("Dev tools for fig's autocomplete")
  .version("1.0.0");
program.addCommand(init);
program.addCommand(createSpec);
program.addCommand(compile);
program.addCommand(dev);
program.addCommand(merge);

if (process.env.GENERATE_SPEC) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  import("@withfig/commander").then((module) => {
    program.command("generateFigSpec").action(() => {
      module.generateFigSpec(program, "generated/autocomplete-tools-spec-new.ts");
    });
    program.parse(process.argv);
  });
} else {
  program.parse(process.argv);
}
