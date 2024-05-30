import commander from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new commander.Command();

program
  .option("-c, --color <type>", "specify the color", "blue")
  .addOption(new commander.Option("-n, --number <type>").default(1))
  .addOption(new commander.Option("-s, --string <type>").default("hello"))
  .addOption(new commander.Option("-b, --bool <type>").default(true))
  .addOption(new commander.Option("-a, --arr <type>").default([1, 2, 3]))
  .addOption(new commander.Option("-o, --obj <type>").default({ test: "val" }))
  .addOption(new commander.Option("-m, --map <type>").default(new Map()));

addCompletionSpecCommand(program);
program.parse(process.argv);
