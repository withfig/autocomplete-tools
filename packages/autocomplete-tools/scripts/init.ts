import run from "create-completion-spec";
import { Command } from "commander";

const program = new Command("init")
  .description("initialize fig custom spec boilerplate in current directory")
  .action(run);

export default program;
