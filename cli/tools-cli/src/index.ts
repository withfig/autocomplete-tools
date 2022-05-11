#!/usr/bin/env node
import { Command } from "commander";
import merge from "./scripts/merge";
import dev from "./scripts/dev";
import createSpec from "./scripts/create-spec";
import compile from "./scripts/compile";
import init from "./scripts/init";
import version from "./scripts/version";

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
program.addCommand(version);

export { program };
