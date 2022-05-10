import { build } from "esbuild";
import { exec } from "child_process";
import chokidar from "chokidar";
import { Command } from "commander";
import glob from "fast-glob";
import SpecLogger, { Level } from "./log";

// Folder names
const SOURCE_FOLDER_NAME = "src";
const DESTINATION_FOLDER_NAME = "build";

function execWithError(command: string, logNodeErrors = false) {
  exec(command, (error, stdout, stderr) => {
    if (logNodeErrors && error) {
      SpecLogger.log(`node error running "${command}": ${error.message}`, Level.ERROR);
      return;
    }
    if (stderr) {
      SpecLogger.log(`shell error running "${command}": ${stderr}`, Level.ERROR);
    }
  });
}

function invalidateCache() {
  execWithError("fig settings autocomplete.developerModeNPMInvalidateCache true");
}

/**
 * Transpiles all passed files and prints the progress
 * @param specs Array of filepaths
 */
async function processFiles(files: string[], isDev?: boolean) {
  const fileName = files.length === 1 ? files[0] : `${files.length} specs`;
  await build({
    entryPoints: files,
    outdir: DESTINATION_FOLDER_NAME,
    bundle: true,
    format: "esm",
    minify: true,
    ...(isDev && { sourcemap: "inline" }),
  }).catch((e) => SpecLogger.log(`Error building ${fileName}: ${e.message}`, Level.ERROR));
  SpecLogger.log(`Built ${fileName}`);
  invalidateCache();
}

export async function runCompiler(options: Record<string, any>) {
  const SOURCE_FILE_GLOB = `${SOURCE_FOLDER_NAME}/**/*.ts`;
  const files = await glob(SOURCE_FILE_GLOB);
  await processFiles(files);

  if (options.watch) {
    const watcher = chokidar.watch(SOURCE_FILE_GLOB, { ignoreInitial: true });

    // Process the changed file
    watcher.on("change", (file) => processFiles([file], true));
    watcher.on("add", (file) => processFiles([file], true));
  }
}

const program = new Command("compile")
  .description("compile specs in the current directory")
  .option("-w, --watch", "Watch files and re-compile on change")
  .action(runCompiler);

export default program;
