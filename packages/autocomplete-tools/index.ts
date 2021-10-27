import { Command } from "commander";
// eslint-disable-next-line import/no-extraneous-dependencies
import { generateFigSpec } from "@withfig/commander";
import merge from "./scripts/merge";
import dev from "./scripts/dev";
import createSpec from "./scripts/create-spec";
import compile from "./scripts/compile";

const program = new Command();

program.name("@withfig/autocomplete-tools").version("1.0.0");
program.command("init", "initialize fig custom spec boilerplate in current directory", {
  executableFile: "scripts/init",
});
program.addCommand(createSpec);
program.addCommand(compile);
program.addCommand(dev);
program.addCommand(merge);

if (process.env.NODE_ENV === "development") {
  program.command("generateFigSpec").action(() => {
    generateFigSpec(program, "autocomplete-tools.ts");
  });
}
program.parse(process.argv);
