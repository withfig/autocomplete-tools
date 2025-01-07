import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import chokidar from "chokidar";
import { Command } from "commander";
import glob from "fast-glob";
import SpecLogger, { Level } from "./log";
import { setSetting } from "./settings";

// Folder names
const SOURCE_FOLDER_NAME = "src";
const DEFAULT_DESTINATION_FOLDER_NAME = "build";

function invalidateCache() {
  setSetting("autocomplete.developerModeNPMInvalidateCache", true);
}

/**
 * Generate index files for spec build
 */
async function generateIndex(outdir: string, files: string[]) {
  const parsedFiles = files.map(path.parse);

  const diffVersionedSpecNames = parsedFiles
    .filter(({ base }) => base === "index.ts")
    .map(({ dir }) => dir.replace(/^src\//, ""));
  diffVersionedSpecNames.sort();

  const specNames = parsedFiles
    .filter(({ base, ext }) => base !== "index.ts" && ext === ".ts")
    .map((p) => `${p.dir}/${p.name}`.replace(/^src\//, ""))
    .concat(diffVersionedSpecNames);
  specNames.sort();

  const modules = files
    .filter((p) => fsSync.statSync(p).isFile())
    .map(path.parse)
    .map((p) => `${p.dir}/${p.name}`.replace(/^src\//, ""));

  await fs.mkdir(outdir, { recursive: true });
  await fs.mkdir(path.join(outdir, "dynamic"), { recursive: true });

  // index.js
  await fs.writeFile(
    path.join(outdir, "index.js"),
    `var e=${JSON.stringify(specNames)},diffVersionedCompletions=${JSON.stringify(
      diffVersionedSpecNames
    )};export{e as default,diffVersionedCompletions};`
  );
  // index.json
  await fs.writeFile(
    path.join(outdir, "index.json"),
    JSON.stringify({
      completions: specNames,
      diffVersionedCompletions: diffVersionedSpecNames,
    })
  );
  // index.d.ts
  await fs.writeFile(
    path.join(outdir, "index.d.ts"),
    `declare const completions: string[]
declare const diffVersionedCompletions: string[]
export { completions as default, diffVersionedCompletions }
`
  );
  // dynamic/index.js
  await fs.writeFile(
    path.join(outdir, "dynamic/index.js"),
    `var e={${modules
      .map((mod) => `${JSON.stringify(mod)}:()=>import(${JSON.stringify(`../${mod}.js`)})`)
      .join(",")}};export{e as default};`
  );
  // dynamic/index.d.ts
  await fs.writeFile(
    path.join(outdir, "dynamic/index.d.ts"),
    `declare const completions: {
    [key: string]: () => Promise<{
        default: any;
    }>
}
export { completions as default }
`
  );
}

/**
 * Transpiles all passed files and prints the progress
 * @param specs Array of filepaths
 */
async function processFiles(files: string[], isDev?: boolean, outdir?: string) {
  const fileName = files.length === 1 ? files[0] : `${files.length} specs`;

  await Promise.all([
    build({
      entryPoints: files,
      outdir: outdir ?? DEFAULT_DESTINATION_FOLDER_NAME,
      bundle: true,
      outbase: "src",
      format: "esm",
      minify: true,
      plugins: [NodeModulesPolyfillPlugin()],
      ...(isDev && { sourcemap: "inline" }),
    }).catch((e) => SpecLogger.log(`Error building ${fileName}: ${e.message}`, Level.ERROR)),
    generateIndex(outdir ?? DEFAULT_DESTINATION_FOLDER_NAME, files),
  ]);

  SpecLogger.log(`Built ${fileName}`);
  invalidateCache();
}

export async function runCompiler({ watch, outdir }: { watch: boolean; outdir?: string }) {
  const SOURCE_FILE_GLOB = `${SOURCE_FOLDER_NAME}/**/*.ts`;
  const files = await glob(SOURCE_FILE_GLOB);

  await processFiles(files, undefined, outdir);

  if (watch) {
    const watcher = chokidar.watch(SOURCE_FILE_GLOB, { ignoreInitial: true });

    // Process the changed file
    watcher.on("change", (file) => processFiles([file], true, outdir));
    watcher.on("add", (file) => processFiles([file], true, outdir));
  }
}

const program = new Command("compile")
  .description("compile specs in the current directory")
  .option("-w, --watch", "Watch files and re-compile on change")
  .option("-o, --outdir <dir>", "Output directory")
  .action(runCompiler);

export default program;
