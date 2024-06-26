import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program
  .helpOption("-c, --HELP", "custom help message")
  .option("-s, --sessions", "add session support")
  .option("-t, --template <engine>", "specify template engine (jade|ejs) [jade]", "jade")
  .addHelpCommand("hlp [argument]", "some nice description");

program.command("child").option("--gender", "specific gender of child");

addCompletionSpecCommand(program);
program.parse(process.argv);
