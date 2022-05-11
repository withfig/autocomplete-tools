import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program.addArgument(
  new commander.Argument("<drink-size>", "drink cup size").choices(["small", "medium", "large"])
);

addCompletionSpecCommand(program);
