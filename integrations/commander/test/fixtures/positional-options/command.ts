import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program.enablePositionalOptions().option("-p, --progress");

program.command("upload <file>").option("-p, --port <number>", "port number", "80");

addCompletionSpecCommand(program);
program.parse(process.argv);
