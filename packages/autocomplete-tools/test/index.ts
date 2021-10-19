import fs from "fs";
import child from "child_process";
import path from "path";

const cliPath = path.join(__dirname, "..", "index.ts");
const fixturesPath = path.join(__dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const fixtureDirPath = path.join(fixturesPath, dir.name);
    const oldSpecPath = path.join(fixtureDirPath, "old.ts");
    const newSpecPath = path.join(fixtureDirPath, "new.ts");
    const updatedSpecPath = path.join(fixtureDirPath, "updated.ts"); // gitignored
    const expectedSpecPath = path.join(fixtureDirPath, "expected.ts");
    const configPath = path.join(fixtureDirPath, "config.json");

    let configString = `-n ${updatedSpecPath}`;
    if (fs.existsSync(configPath)) {
      const { ignoreProps } = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (ignoreProps && Array.isArray(ignoreProps)) {
        configString += ` --ignore-props ${ignoreProps.join(",")}`;
      }
    }

    const cmd = `node -r ts-node/register ${cliPath} merge ${oldSpecPath} ${newSpecPath} ${configString}`;

    try {
      child.execSync(cmd);
    } catch (error) {
      console.warn(`- Encounterd an error when running fixture ${fixtureDirPath}.\n${error}`);
    }

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      fs.copyFileSync(updatedSpecPath, expectedSpecPath);
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

runFixtures();
