import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program
  .option("-n, --number <value...>", "specify numbers")
  .option("-l, --letter [value...]", "specify letters");

generateFigSpec(program, "output.ts", { cwd: __dirname });
