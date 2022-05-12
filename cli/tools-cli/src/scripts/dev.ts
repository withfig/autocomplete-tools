import os from "os";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { execSync } from "child_process";
import { runCompiler } from "./compile";

const AUTOCOMPLETE_LOG_FILE = path.join(os.homedir(), ".fig", "logs", "specs.log");

function commandStatus(cmd: string): boolean {
  try {
    execSync(cmd);
    return true;
  } catch {
    return false;
  }
}

function disableDevMode() {
  console.log("\n\nFig dev mode disabled\n");
  commandStatus("fig settings autocomplete.developerMode false");
  commandStatus("fig settings autocomplete.developerModeNPM false");
  commandStatus("fig settings autocomplete.developerModeNPMInvalidateCache false");
  process.exit(0);
}

function cleanup() {
  disableDevMode();
  fs.unwatchFile(AUTOCOMPLETE_LOG_FILE);
}

async function runProgram() {
  console.clear();
  const isMacOS = os.type() === "Darwin";

  if (isMacOS) {
    const globalFigAppPath = path.join("/", "Applications", "Fig.app");
    const localFigAppPath = path.join(os.homedir(), "Applications", "Fig.app");

    if (!fs.existsSync(globalFigAppPath) && !fs.existsSync(localFigAppPath)) {
      console.log(
        "\n******\n\n",
        chalk.bold(chalk.yellow(" WARNING: Fig App is not installed")),
        "\n\n",
        chalk.bold(chalk.cyan(" Download Fig at:")),
        "\n https://fig.io/",
        "\n\n******\n"
      );
    } else if (!commandStatus("fig --version")) {
      console.log(
        "\n******\n\n",
        chalk.bold(chalk.yellow(" WARNING: Fig Cli is not installed")),
        "\n\n",
        chalk.bold(
          chalk.cyan(
            " 1. Run the install and update script ( ◧ > Integrations > Developer > Run install and update script)"
          )
        ),
        "\n",
        chalk.bold(chalk.cyan(" 2. Create a new terminal session")),
        "\n\n******\n"
      );
    }
  } else {
    console.log(
      "\n******\n\n",
      chalk.bold(
        chalk.red(
          " WARNING: Looks like you're not on macOS. We're working on linux / windows builds!"
        )
      ),
      "\n\n",
      chalk.bold(
        chalk.yellow(
          " You can still build and contribute to completion specs, but you won't be able to test them unless you are on a mac or a macosVM"
        )
      ),
      "\n\n******\n"
    );
  }

  console.log(
    `Welcome to ${chalk.magenta("Fig Dev Mode")}\n\n`,
    `1. Edit your spec(s) in the ${chalk.bold("src/")} directory\n`,
    `2. On save, they will compile to the local ${chalk.bold("build/")} directory\n`,
    `3. Test your changes ${chalk.bold("instantly")} in your terminal\n`,
    `4. When done, hit ${chalk.bold("ctrl + c")} to exit\n`
  );
  if (isMacOS) {
    // We are on macos and the fig script exists
    process.addListener("SIGTERM", cleanup);
    process.addListener("SIGINT", cleanup);
    process.addListener("SIGQUIT", cleanup);

    commandStatus("fig settings autocomplete.developerModeNPM true");
    commandStatus(
      `fig settings autocomplete.devCompletionsFolder ${path
        .join(process.cwd(), "build")
        .replace(/(\s+)/g, "\\$1")}`
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
    await runCompiler({ watch: true });
  }
}

const program = new Command("dev")
  .description("watch for changes and compile specs")
  .action(runProgram);

export default program;
