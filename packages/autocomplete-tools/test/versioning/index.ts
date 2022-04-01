import fs from "fs";
import child from "child_process";
import path from "path";

const cliPath = path.join(__dirname, "..", "..", "index.ts");
const fixturesPath = path.join(__dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

export function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const absoluteFixtureDirPath = path.join(fixturesPath, dir.name);
    const relativeFixtureDirPath = path.join("fixtures", dir.name);
    const oldSpecName = path.join(relativeFixtureDirPath, "old-spec");
    const newSpecPath = path.resolve(absoluteFixtureDirPath, "new-spec.ts");
    const updatedSpecPath = path.join(absoluteFixtureDirPath, "updated-spec"); // gitignored
    const expectedSpecPath = path.join(absoluteFixtureDirPath, "expected-spec");
    const configPath = path.join(absoluteFixtureDirPath, "config.json");

    let newVersion: string;

    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      newVersion = config.newVersion;
      // TODO: load other options
    } catch (error) {
      throw new Error(
        `You must provide a config.json file for fixture at ${absoluteFixtureDirPath}`
      );
    }

    const cmd = `node -r ts-node/register ${cliPath} version add-diff ${oldSpecName} ${newSpecPath} ${newVersion} --new-file ${updatedSpecPath}`;

    try {
      child.execSync(cmd);
    } catch (error) {
      console.warn(
        `- Encounterd an error when running fixture ${absoluteFixtureDirPath}.\n${error}`
      );
    }

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      fs.copyFileSync(updatedSpecPath, expectedSpecPath);
    } else {
      const updateSpec = fs.readFileSync(updatedSpecPath);
      const expectedSpec = fs.readFileSync(expectedSpecPath);
      if (!updateSpec.equals(expectedSpec)) {
        hadErrors = true;
        console.error(`- Fixture ${absoluteFixtureDirPath} is failing.`);
      }
    }
  }
  if (hadErrors) {
    process.exit(1);
  }
}
