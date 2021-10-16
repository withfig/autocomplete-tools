import { Command } from "commander";
import { generateFigSpec } from "../../../src";

const program = new Command();

program.argument("<utility>").argument("[args...]").passThroughOptions().option("-d, --dry-run");

generateFigSpec(program, "output.ts", { cwd: __dirname });
