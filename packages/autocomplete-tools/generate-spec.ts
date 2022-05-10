// eslint-disable-next-line import/no-extraneous-dependencies
import { addCompletionSpecCommand } from "@fig/complete-commander";
import { program } from "./src";

addCompletionSpecCommand(program);
program.parse(process.argv);
