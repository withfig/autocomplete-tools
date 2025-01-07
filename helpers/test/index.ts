import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import prettier from "prettier";
import { getVersionFromVersionedSpec } from "../src/versions";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const fixturesPath = path.join(dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

async function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const fixtureDirPath = path.join(fixturesPath, dir.name);
    const specVersionPath = path.join(fixtureDirPath, "spec", "1.0.0.js");
    const outputSpecPath = path.join(fixtureDirPath, "output.json"); // gitignored
    const expectedSpecPath = path.join(fixtureDirPath, "expected.json");
    const configPath = path.join(fixtureDirPath, "config.json");

    const { targetVersion } = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // eslint-disable-next-line no-await-in-loop
    const importedModule = await import(specVersionPath); // note this is CJS
    // eslint-disable-next-line no-await-in-loop
    const outputSpec = await prettier.format(
      JSON.stringify(
        getVersionFromVersionedSpec(
          importedModule.completion,
          importedModule.versions,
          targetVersion
        )
      ),
      { parser: "json" }
    );
    fs.writeFileSync(outputSpecPath, outputSpec);

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      fs.copyFileSync(outputSpecPath, expectedSpecPath);
    } else {
      const expectedSpec = fs.readFileSync(expectedSpecPath, { encoding: "utf8" });
      if (expectedSpec !== outputSpec) {
        hadErrors = true;
        console.error(`- Fixture ${fixtureDirPath} is failing.`);
      }
    }
  }
  if (hadErrors) {
    process.exit(1);
  }
}

runFixtures();
