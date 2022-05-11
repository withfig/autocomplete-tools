import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program.addArgument(
  new commander.Argument("[timeout]", "timeout in seconds").default(60, "one minute")
);

addCompletionSpecCommand(program);
