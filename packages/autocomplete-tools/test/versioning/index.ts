import fs from "fs";
import child from "child_process";
import path from "path";
import { copyDirectorySync } from "../../scripts/version";

const cliPath = path.join(__dirname, "..", "..", "index.ts");
const fixturesPath = path.join(__dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

export function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const fixtureDirPath = path.join(fixturesPath, dir.name);
    const oldSpecName = path.join(fixtureDirPath, "old-spec");
    const newSpecPath = path.resolve(fixtureDirPath, "new-spec.ts");
    const updatedSpecPath = path.join(fixtureDirPath, "updated-spec"); // gitignored
    const expectedSpecPath = path.join(fixtureDirPath, "expected-spec");
    const configPath = path.join(fixtureDirPath, "config.json");

    let newVersion: string;

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      newVersion = config.newVersion;
      // TODO: load other options
    } catch (error) {
      throw new Error(`You must provide a config.json file for fixture at ${fixtureDirPath}`);
    }

    const cmd = `node -r ts-node/register ${cliPath} version add-diff ${oldSpecName} ${newSpecPath} ${newVersion} --new-path ${updatedSpecPath}`;

    try {
      child.execSync(cmd);
    } catch (error) {
      console.warn(`- Encounterd an error when running fixture ${fixtureDirPath}.\n${error}`);
    }

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      copyDirectorySync(updatedSpecPath, expectedSpecPath);
    } else {
      const updateSpec = fs.readFileSync(updatedSpecPath);
      const expectedSpec = fs.readFileSync(expectedSpecPath);
      if (!updateSpec.equals(expectedSpec)) {
        hadErrors = true;
        console.error(`- Fixture ${fixtureDirPath} is failing.`);
      }
    }
  }
  if (hadErrors) {
    process.exit(1);
  }
}
