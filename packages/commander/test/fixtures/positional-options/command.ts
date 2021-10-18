import { Command } from "commander";
import { generateFigSpec } from "../../../src";

const program = new Command();

program.enablePositionalOptions().option("-p, --progress");

program.command("upload <file>").option("-p, --port <number>", "port number", "80");

generateFigSpec(program, "output.ts", { cwd: __dirname });
