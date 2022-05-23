import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program
  .version("0.0.1", "-v, --VERSION", "new version message")
  .option("-s, --sessions", "add session support")
  .option("-t, --template <engine>", "specify template engine (jade|ejs) [jade]", "jade");

addCompletionSpecCommand(program);
program.parse(process.argv);
