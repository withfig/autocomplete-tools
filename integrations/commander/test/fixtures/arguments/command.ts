import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program.version("0.1.0").arguments("<username> [password]");

addCompletionSpecCommand(program);
program.parse(process.argv);
