import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program.addOption(
  new commander.Option("-d, --drink <size>", "drink cup size").choices(["small", "medium", "large"])
);

generateFigSpec(program, "output.ts", { cwd: __dirname });
