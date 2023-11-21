import { build } from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import chokidar from "chokidar";
import { Command } from "commander";
import glob from "fast-glob";
import SpecLogger, { Level } from "./log";
import { setSetting } from "./settings";

// Folder names
const SOURCE_FOLDER_NAME = "src";
const DESTINATION_FOLDER_NAME = "build";

function invalidateCache() {
  setSetting("autocomplete.developerModeNPMInvalidateCache", true);
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
    outbase: "src",
    format: "esm",
    minify: true,
    plugins: [NodeModulesPolyfillPlugin()],
    ...(isDev && { sourcemap: "inline" }),
  }).catch((e) => SpecLogger.log(`Error building ${fileName}: ${e.message}`, Level.ERROR));
  SpecLogger.log(`Built ${fileName}`);
  invalidateCache();
}

export async function runCompiler(options: { watch: boolean }) {
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
