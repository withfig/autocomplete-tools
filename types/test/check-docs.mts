import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import prettier from "prettier";
import pc from "picocolors";
// eslint-disable-next-line import/no-relative-packages
import { analyze, generate } from "../docs-generator/dist";

const dirname = new URL(".", import.meta.url).pathname;
const docsPath = path.resolve(dirname, "..", "index.d.ts");

const currentDocs = fs.readFileSync("docs.json", { encoding: "utf-8" });
const expectedDocs = await prettier.format(JSON.stringify(generate(analyze(docsPath))), {
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
