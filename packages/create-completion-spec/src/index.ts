#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import pc from "picocolors";

export default function runProgram() {
  const boilerplateDir = path.resolve(__dirname, "..", "boilerplate");
  const dir = path.join(process.cwd(), ".fig", "autocomplete");
  console.log(pc.yellow("Copying boilerplate directory..."));
  fs.mkdirSync(dir, { recursive: true });
  execSync(`cp -a ${boilerplateDir}/. ${dir}`);
  console.log(pc.green("Finished copying boilerplate directory"));
  console.log("----");
  console.log(pc.yellow("Installing npm deps..."));
  try {
    execSync("npm i", { cwd: dir });
    console.log(pc.green("Finished installing npm deps"));
  } catch {
    console.log(pc.red("Error installing npm deps, please install them manually"));
  }
}
