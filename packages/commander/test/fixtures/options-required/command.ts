import commander from "commander";
import { generateFigSpec } from "../../../src";

const program = new commander.Command();

program.requiredOption("-c, --cheese <type>", "pizza must have cheese");

generateFigSpec(program, "output.ts", { cwd: __dirname });
