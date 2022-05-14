import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program.addOption(
  new commander.Option("-d, --drink <size>", "drink cup size").choices(["small", "medium", "large"])
);

addCompletionSpecCommand(program);
program.parse(process.argv);
