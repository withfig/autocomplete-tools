import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program.argument("<utility>").argument("[args...]").passThroughOptions().option("-d, --dry-run");

addCompletionSpecCommand(program);
program.parse(process.argv);
