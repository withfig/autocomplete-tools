import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

const brew = program.command("brew");
brew.command("tea");
brew.command("coffee");

function makeHeatCommand() {
  const heat = new commander.Command("heat");
  heat.command("jug");
  heat.command("pot");
  return heat;
}
program.addCommand(makeHeatCommand());

addCompletionSpecCommand(program);
