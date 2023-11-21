import { program } from "commander";
import path from "path";
import fs from "fs/promises";
import prettier from "prettier";
import { analyze } from "./src/analyzer";
import { generate } from "./src/generate";

const DECLARATIONS_PATH = path.resolve(__dirname, "..", "index.d.ts");

program.name("autocomplete-types-docs-generator");
program.argument("<outfile>");
program.action(async (outfile) => {
  const absoluteOutfile = path.resolve(outfile);
  console.info(`Using ${DECLARATIONS_PATH} as input file.`);
  fs.writeFile(
    absoluteOutfile,
    await prettier.format(JSON.stringify(generate(analyze(DECLARATIONS_PATH))), { parser: "json" })
  );
});
program.parse();
