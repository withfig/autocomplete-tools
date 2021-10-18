import commander from "commander";
import { generateFigSpec } from "../../../src";

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

generateFigSpec(program, "output.ts", { cwd: __dirname });
