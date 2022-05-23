import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program
  .option("-n, --number <value...>", "specify numbers")
  .option("-l, --letter [value...]", "specify letters");

addCompletionSpecCommand(program);
program.parse(process.argv);
