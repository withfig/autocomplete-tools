import fs from "fs";
import path from "path";
import { merge } from "../src/merge";

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

    let ignoreProps;
    let preset;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      preset = config.preset;
      ignoreProps = config.ignoreProps;
    }

    const oldSpec = fs.readFileSync(oldSpecPath, { encoding: "utf-8" });
    const newSpec = fs.readFileSync(newSpecPath, { encoding: "utf-8" });
    const updatedSpec = merge(oldSpec, newSpec, {
      ...(preset && { preset }),
      ...(ignoreProps && Array.isArray(ignoreProps) && { ignore: { commonProps: ignoreProps } }),
    });
    fs.writeFileSync(updatedSpecPath, updatedSpec);

    if (process.env.OVERWRITE || !fs.existsSync(expectedSpecPath)) {
      fs.copyFileSync(updatedSpecPath, expectedSpecPath);
    } else {
      const expectedSpec = fs.readFileSync(expectedSpecPath);
      if (!Buffer.from(updatedSpec).equals(expectedSpec)) {
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
