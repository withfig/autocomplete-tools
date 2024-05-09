import os from "os";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { runCompiler } from "./compile";
import { isQInstalled, setSetting } from "./settings";

const AUTOCOMPLETE_LOG_FILE = path.join(os.homedir(), ".fig", "logs", "specs.log");

function disableDevMode() {
  console.log("\n\nFig dev mode disabled\n");
  setSetting("autocomplete.developerMode", false);
  setSetting("autocomplete.developerModeNPM", false);
  setSetting("autocomplete.developerModeNPMInvalidateCache", true);
  process.exit(0);
}

function cleanup() {
  disableDevMode();
  fs.unwatchFile(AUTOCOMPLETE_LOG_FILE);
}

async function runProgram({ outdir }: { outdir?: string }) {
  console.clear();

  if (os.type() === "Darwin") {
    const globalFigAppPath = "/Applications/Fig.app";
    const localFigAppPath = path.join(os.homedir(), "Applications/Fig.app");
    const globalQAppPath = "/Applications/Amazon Q.app";
    const localQAppPath = path.join(os.homedir(), "Applications/Amazon Q.app");

    if (
      !fs.existsSync(globalFigAppPath) &&
      !fs.existsSync(localFigAppPath) &&
      !fs.existsSync(globalQAppPath) &&
      !fs.existsSync(localQAppPath)
    ) {
      console.log(
        "\n******\n\n",
        chalk.bold(chalk.yellow(" WARNING: Amazon Q for command line app is not installed")),
        "\n\n",
        chalk.bold(chalk.cyan(" Download Amazon Q for command line at:")),
        "\n https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-getting-started-installing.html",
        "\n\n******\n"
      );
    }
  } else if (os.type() === "Linux") {
    console.log(
      "\n******\n\n",
      chalk.bold(chalk.yellow(" WARNING: Amazon Q for command line on Linux is not supported yet")),
      "\n\n"
    );
  } else if (!isQInstalled()) {
    console.log(
      "\n******\n\n",
      chalk.bold(chalk.yellow(" WARNING: Amazon Q for command line is not installed")),
      "\n\n",
      chalk.bold(chalk.cyan(" Download Amazon Q for command line at:")),
      "\n https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-getting-started-installing.html",
      "\n\n******\n"
    );
  }

  console.log(
    `Welcome to ${chalk.magenta("Fig Dev Mode")}!\n\n`,
    `All completions will be loaded from ${chalk.bold(
      `${process.cwd()}/${outdir ?? "build"}`
    )}. (Note: other completions won't work while in dev mode).\n\n`,
    `1. Edit your spec(s) in the ${chalk.bold("src/")} directory.\n`,
    `2. Test changes ${chalk.bold("instantly")} on save in your terminal.\n`,
    `3. Exit developer mode with ${chalk.bold("ctrl + c")}.\n\n`,
    `${chalk.bold("Other Notes:")}\n`,
    `- Generators run on every keystroke\n`
  );
  // We are on macos and the fig script exists
  process.addListener("SIGTERM", cleanup);
  process.addListener("SIGINT", cleanup);
  process.addListener("SIGQUIT", cleanup);

  setSetting("autocomplete.developerModeNPM", true);
  setSetting(
    "autocomplete.devCompletionsFolder",
    path.join(process.cwd(), outdir ?? "build").replace(/(\s)/g, "\\$1")
  );
  if (!fs.existsSync(path.dirname(AUTOCOMPLETE_LOG_FILE))) {
    fs.mkdirSync(path.dirname(AUTOCOMPLETE_LOG_FILE), { recursive: true });
  }
  fs.writeFileSync(AUTOCOMPLETE_LOG_FILE, "", { encoding: "utf8" });
  let previousLogContent = "";
  fs.watch(AUTOCOMPLETE_LOG_FILE, (event) => {
    if (event === "change") {
      const currentContent = fs.readFileSync(AUTOCOMPLETE_LOG_FILE, { encoding: "utf8" }).trim();
      const message = previousLogContent
        ? currentContent.split("\n").slice(previousLogContent.split("\n").length).join("\n")
        : currentContent;
      console.log(chalk.yellow(message));
      previousLogContent = currentContent;
    }
  });
  await runCompiler({ watch: true, outdir });
}

const program = new Command("dev")
  .description("watch for changes and compile specs")
  .option("-o, --outdir <dir>", "Output directory")
  .action(runProgram);

export default program;
