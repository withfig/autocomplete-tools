import { Command } from "commander";
import { generateFigSpec } from "../../../src";

const program = new Command();

program
  .helpOption("-c, --HELP", "custom help message")
  .option("-s, --sessions", "add session support")
  .option("-t, --template <engine>", "specify template engine (jade|ejs) [jade]", "jade");

program.command("child").option("--gender", "specific gender of child");

generateFigSpec(program, "output.ts", { cwd: __dirname });
