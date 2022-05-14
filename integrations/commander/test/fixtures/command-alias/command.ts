import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

const program = new Command();

program
  .version("0.0.1")
  .description("Fake package manager")
  .addCommand(
    new Command("install").argument("[name]").description("install one or more packages").alias("i")
  )
  .addCommand(
    new Command("search").argument("[query]").description("search with optional query").alias("s")
  );
addCompletionSpecCommand(program);
program.parse(process.argv);
