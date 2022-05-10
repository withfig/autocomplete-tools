/* eslint-disable no-await-in-loop */
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { fileURLToPath } from "url";
import { GenerationError } from "../src/errors.js";
import { run } from "../src/index.js";
import { Config } from "./types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const fixturesPath = path.join(dirname, "fixtures");
const dirs = fs
  .readdirSync(fixturesPath, { withFileTypes: true })
  .filter((file) => file.isDirectory() && file.name !== ".DS_Store");

async function runFixtures() {
  let hadErrors = false;
  for (const dir of dirs) {
    const fixtureDirPath = path.join(fixturesPath, dir.name);
    const outputPath = path.join(fixtureDirPath, "output.txt"); // gitignored
    const expectedPath = path.join(fixtureDirPath, "expected.txt");
    const configPath = path.join(fixtureDirPath, "config.json");

    // If assert is undefined it means that the request should never touch the server
    const { options, assert }: Config = JSON.parse(
      fs.readFileSync(configPath, { encoding: "utf-8" })
    );
    // NOTE: we are not using the `token` value in tests so we use
    // it to pass a base64 encoded string to the server.ts containing data to check
    const encodedData = Buffer.from(JSON.stringify(assert ?? "{}")).toString("base64");
    if (options.specPath) {
      options.specPath = path.resolve(fixtureDirPath, options.specPath)
    }
    if (options.binaryPath) {
      options.binaryPath = path.resolve(fixtureDirPath, options.binaryPath)
    }

    let out: string;
    try {
      await run({
        ...options,
        token: encodedData,
      });
      out = "Ok";
    } catch (error) {
      const { name, message } = error as Error
      if (error instanceof GenerationError) {
        out = "GenerationError: some kind of generation error was produced, run the tests with VERBOSE=true env variable to see more"
      } else {
        out = `${name}: ${message}`;
      }
      if (process.env.VERBOSE) {
        console.error(error)
      }
    }
    fs.writeFileSync(outputPath, out);

    if (process.env.OVERWRITE || !fs.existsSync(expectedPath)) {
      fs.copyFileSync(outputPath, expectedPath);
      console.log(pc.yellow(`Fixture "${dir.name}" was regenerated`));
    } else {
      const expected = fs.readFileSync(expectedPath);
      if (!Buffer.from(out).equals(expected)) {
        hadErrors = true;
        console.log("\n");
        console.log(pc.red(`Fixture "${dir.name}" is failing:`));
        console.log(pc.red(`- ${expected.toString("utf-8")}`));
        console.log(pc.green(`+ ${out}`));
      } else {
        console.log(pc.green(`Fixture "${dir.name}" is passing`));
      }
    }
    console.log(pc.bold("\n-----"))
  }
  if (hadErrors) {
    process.exit(1);
  }
}

await runFixtures()
