import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program
  .version("0.0.1")
  .description("Application simple description")
  .option("-f, --foo", "enable some foo");

addCompletionSpecCommand(program);
