import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program.addArgument(
  new commander.Argument("[timeout]", "timeout in seconds").default(60, "one minute")
);

generateFigSpec(program, "output.ts", { cwd: __dirname });
