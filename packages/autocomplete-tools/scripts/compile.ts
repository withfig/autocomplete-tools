import { Command } from "commander";
import fs from "fs";
import ts from "typescript";
import path from "path";
import ProgressBar from "progress";
import { exec } from "child_process";
import chokidar from "chokidar";
import SpecLogger, { Level } from "./log";
import { specTransformer } from "./transformer";

// Folder names
const SOURCE_FOLDER_NAME = "src";
const DESTINATION_FOLDER_NAME = "build";

function execWithError(command: string) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      SpecLogger.log(
        `node error running "${command}": ${error.message}`,
        Level.ERROR
      );
      return;
    }
    if (stderr) {
      SpecLogger.log(
        `shell error running "${command}": ${stderr}`,
        Level.ERROR
      );
    }
  });
}

function invalidateCache() {
  execWithError(
    "fig settings autocomplete.developerModeNPMInvalidateCache true"
  );
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(dir, fileName);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

/**
 * Process a spec by transpiling it with the TypeScript
 * compiler.
 * @param filePath The file to process
 */
const processSpec = (filePath: string) => {
  const source = fs.readFileSync(filePath).toString();
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
    },
    transformers: {
      before: [specTransformer],
    },
  });

  const relativeFilePath = filePath
    .replace(`${SOURCE_FOLDER_NAME}/`, "")
    .replace(".ts", ".js");

  const outFilePath = path.resolve(DESTINATION_FOLDER_NAME, relativeFilePath);
  const outDirname = path.dirname(outFilePath);

  if (!fs.existsSync(outDirname)) {
    fs.mkdirSync(outDirname);
  }

  // Remove unessesary export at the end of js files
  const jsOutput = result.outputText.replace("export {};", "");

  fs.writeFileSync(outFilePath, jsOutput);
};

/**
 * Transpiles all passed files and prints the progress
 * @param specs Array of filepaths
 */
function processFiles(specs: string[]) {
  // Process all the files in the specs directory
  SpecLogger.log(`Processing ${specs.length} specs...`);

  const bar = new ProgressBar(":bar :percent", {
    total: specs.length,
    complete: "=",
    head: ">",
    incomplete: " ",
  });

  // Make sure that the destination folder exists
  if (!fs.existsSync(DESTINATION_FOLDER_NAME)) {
    // if not create it
    fs.mkdirSync(DESTINATION_FOLDER_NAME);
  }

  specs.forEach((spec) => {
    processSpec(spec);
    bar.tick({ spec });
  });

  SpecLogger.log(
    `Specs compiled successfully to /${DESTINATION_FOLDER_NAME} folder!`,
    Level.SUCCESS
  );
}

const program = new Command();

program
  .option("-w, --watch", "Watch files and re-compile on change")
  .option("-i, --invalidate-cache", "Invalidate spec cache");

program.parse(process.argv);

const opts = program.opts();

if (opts.watch) {
  const watcher = chokidar.watch(SOURCE_FOLDER_NAME);

  // Process the changed file
  watcher.on("change", (filePath: string) => {
    processFiles([filePath]);
    invalidateCache();
  });
} else {
  // Get all files from the the source folder recursively
  const specs: string[] = [];
  walkDir(SOURCE_FOLDER_NAME, (filePath) => {
    if (filePath === ".DS_STORE") return;
    specs.push(filePath);
  });
  processFiles(specs);
}

if (opts.invalidate_cache) {
  invalidateCache();
}
