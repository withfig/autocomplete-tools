import fs from "fs";
import child from "child_process";
import path from "path";
import { copyDirectorySync } from "../../src/scripts/version";

const cliPath = path.join(__dirname, "..", "..", "index.ts");
const fixturesPath = path.join(__dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

function assertEqualFiles(path1: string, path2: string): boolean {
  if (!fs.statSync(path1).isFile() || !fs.statSync(path2).isFile()) return false;
  return fs.readFileSync(path1).equals(fs.readFileSync(path2));
}

function assertEqualDirectories(path1: string, path2: string): boolean {
  if (!fs.statSync(path1).isDirectory() || !fs.statSync(path2).isDirectory()) return false;
  const dirA = fs
    .readdirSync(path1, { withFileTypes: true })
    .filter((file) => file.name !== ".DS_Store");
  const dirB = fs
    .readdirSync(path2, { withFileTypes: true })
    .filter((file) => file.name !== ".DS_Store");

  if (dirA.length !== dirB.length) return false;

  for (const dirent of dirA) {
    const dirent1Path = path.join(path1, dirent.name);
    const dirent2Path = path.join(path2, dirent.name);
    if (dirent.isDirectory() && !assertEqualDirectories(dirent1Path, dirent2Path)) {
      return false;
    }
    if (dirent.isFile() && !assertEqualFiles(dirent1Path, dirent2Path)) {
      return false;
    }
  }
  return true;
}

export function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const fixtureDirPath = path.join(fixturesPath, dir.name);
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

    fs.rmSync(updatedSpecPath, { recursive: true, force: true });
    const cmd = `node -r ts-node/register ${cliPath} version add-diff old-spec ${newSpecPath} ${newVersion} --cwd ${fixtureDirPath} --new-path ${updatedSpecPath}`;

    try {
      child.execSync(cmd);
    } catch (error) {
      console.warn(`- Encounterd an error when running fixture ${fixtureDirPath}.\n${error}`);
    }

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      copyDirectorySync(updatedSpecPath, expectedSpecPath);
    } else if (!assertEqualDirectories(expectedSpecPath, updatedSpecPath)) {
      hadErrors = true;
      console.error(`- Fixture ${fixtureDirPath} is failing.`);
    }
  }
  if (hadErrors) {
    process.exit(1);
  }
}
