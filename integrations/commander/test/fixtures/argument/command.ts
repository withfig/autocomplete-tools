import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program
  .version("0.1.0")
  .argument("<username>", "user to login")
  .argument("[password]", "password for user, if required", "no password given")
  .description("example program for argument");

addCompletionSpecCommand(program);
