/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import path from "path";
import fs from "fs";
import child from "child_process";
import { report } from "./utils";

const fixturesPath = path.resolve("test/fixtures/");

function runFixtures() {
  let hadErrors = false;
  const fixtures = fs.readdirSync(fixturesPath, { withFileTypes: true });
  for (const fixture of fixtures) {
    if (!fixture.isDirectory()) continue;
    const fixturePath = path.resolve(fixturesPath, fixture.name);

    const command = path.resolve(fixturePath, "command.ts");
    const expected = path.resolve(fixturePath, "expected.ts");
    const output = path.resolve(fixturePath, "output.ts");
    const options = path.resolve(fixturePath, "options.json");
    let args = "";
    if (fs.existsSync(options)) {
      const parsedOptions = JSON.parse(fs.readFileSync(options, { encoding: "utf8" }));
      args = parsedOptions.args;
    }

    if (!fs.existsSync(command)) {
      hadErrors = true;
      continue;
    }
    try {
      const cmd = `node -r ts-node/register ${command} ${args}`;
      child.execSync(cmd);
    } catch {
      report(fixture.name, "errored");
      hadErrors = true;
      continue;
    }

    if (!fs.existsSync(expected) || process.env.OVERWRITE) {
      fs.copyFileSync(output, expected);
      report(fixture.name, process.env.OVERWRITE ? "regenerated" : "generated");
      continue;
    }

    const outputFile = fs.readFileSync(output);
    const expectedFile = fs.readFileSync(expected);

    const successful = outputFile.equals(expectedFile);
    if (!successful) {
      hadErrors = true;
    }
    report(fixture.name, successful ? "successful" : "failed");
  }

  if (hadErrors) {
    process.exit(1);
  }
}

runFixtures();
