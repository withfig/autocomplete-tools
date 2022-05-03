#!/usr/bin/env node
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import pc from "picocolors";

export default function runProgram() {
  const boilerplateDir = path.resolve(__dirname, "..", "boilerplate");
  const dirs = [
    path.join(process.cwd(), ".fig", "autocomplete"),
    path.join(process.cwd(), ".fig", "user", "autocomplete"),
  ];
  console.log(pc.yellow("Copying boilerplate directory..."));
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
    execSync(`cp -a ${boilerplateDir}/. ${dir}`);
  }
  console.log(pc.green("Finished copying boilerplate directory."));
  console.log("----");
  console.log(pc.yellow("Installing npm deps..."));
  for (const dir of dirs) {
    try {
      execSync("npm i", { cwd: dir });
    } catch (error) {
      continue;
    }
  }
  console.log(pc.green("Finished installing npm deps"));
}
