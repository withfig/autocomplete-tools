import { Command } from "commander";
import { generateFigSpec } from "../../../src";

const program = new Command();

program.version("0.1.0").arguments("<username> [password]");

generateFigSpec(program, "output.ts", { cwd: __dirname });
