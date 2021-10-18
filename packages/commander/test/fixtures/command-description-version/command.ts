import { Command } from "commander";
import { generateFigSpec } from "../../../src";

const program = new Command();

program
  .version("0.0.1")
  .description("Application simple description")
  .option("-f, --foo", "enable some foo");

generateFigSpec(program, "output.ts", { cwd: __dirname });
