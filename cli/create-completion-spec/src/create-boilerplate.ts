import path from "path";
import pc from "picocolors";
import fs from "fs";
import { execSync } from "child_process";

export function createBoilerplateFolder() {
  const dir = path.join(process.cwd(), ".fig", "autocomplete");
  if (!fs.existsSync(dir)) {
    const boilerplateDir = path.resolve(__dirname, "..", "boilerplate");
    console.log(pc.yellow("Copying boilerplate directory..."));
    fs.mkdirSync(dir, { recursive: true });
    execSync(`cp -a ${boilerplateDir}/. ${dir.replace(/(\s+)/g, "\\$1")}`);
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
