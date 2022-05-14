import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program.requiredOption("-c, --cheese <type>", "pizza must have cheese");

addCompletionSpecCommand(program);
program.parse(process.argv);
