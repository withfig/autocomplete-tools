import { Command } from "commander";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

function runProgram(program: Command) {
  program.parse();
  const boilerplateDir = path.resolve(__dirname, "..", "boilerplate");
  for (const dir of [
    path.join(process.cwd(), ".fig", "autocomplete"),
    path.join(process.cwd(), ".fig", "user", "autocomplete"),
  ]) {
    fs.mkdirSync(dir, { recursive: true });
    execSync(`cp -a ${boilerplateDir}/. ${dir}`);
    try {
      execSync("npm i", { cwd: dir });
    } catch (error) {
      continue;
    }
  }
}

const program = new Command();
runProgram(program);
