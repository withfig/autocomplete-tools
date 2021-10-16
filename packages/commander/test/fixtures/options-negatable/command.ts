import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program
  .option("--no-sauce", "Remove sauce")
  .option("--cheese <flavour>", "cheese flavour", "mozzarella")
  .option("--no-cheese", "plain with no cheese");

generateFigSpec(program, "output.ts", { cwd: __dirname });
