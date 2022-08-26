import path from "path";
import pc from "picocolors";
import fs from "fs";
import { execSync } from "child_process";

function rCopySync(from: string, to: string) {
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (fs.statSync(from).isDirectory()) {
      const children = fs.readdirSync(from);
      for (const child of children) {
        rCopySync(path.resolve(from, child), path.resolve(to, child));
      }
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

export function createBoilerplateFolder() {
  const dir = path.join(process.cwd(), ".fig", "autocomplete");
  if (!fs.existsSync(dir)) {
    const boilerplateDir = path.resolve(__dirname, "..", "boilerplate");
    console.log(pc.yellow("Copying boilerplate directory..."));
    try {
      rCopySync(boilerplateDir, dir.replace(/(\s)/g, "\\$1"));
    } catch {
      throw new Error("An error occurred while copying the boilerplate directory");
    }
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
}
