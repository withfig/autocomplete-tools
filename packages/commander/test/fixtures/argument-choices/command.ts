import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program.addArgument(
  new commander.Argument("<drink-size>", "drink cup size").choices(["small", "medium", "large"])
);

generateFigSpec(program, "output.ts", { cwd: __dirname });
