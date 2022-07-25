import fs from "fs";
import path from "path";
import prettier from "prettier";
import pc from "picocolors";
import { analyze, generate } from "../docs-generator";

const docsPath = path.resolve(__dirname, "..", "index.d.ts");

const currentDocs = fs.readFileSync("docs.json", { encoding: "utf-8" });
const expectedDocs = prettier.format(JSON.stringify(generate(analyze(docsPath))), {
  parser: "json",
});

if (currentDocs !== expectedDocs) {
  console.error(
    pc.red(
      "Current docs from @withfig/autocomplete-types are different from the expected ones, please run 'yarn workspace @withfig/autocomplete-types generate-docs' to regenerate them."
    )
  );
  process.exit(1);
} else {
  console.log(pc.green("@withfig/autocomplete-docs are updated"));
}
