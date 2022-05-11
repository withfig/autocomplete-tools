import { program } from "commander";
import { addCompletionSpecCommand } from "../../../src";

program.option(
  "-f, --filename [filename]",
  "The filename to use when reading from stdin. This will be used in source-maps, errors etc."
);
program.option("--presets [list]", "A comma-separated list of preset names.");
program.option("--plugins [list]", "A comma-separated list of plugin names.");
program.option("--config-file [path]", "Path to a .babelrc file to use.");
program.option(
  "--env-name [name]",
  "The name of the 'env' to use when loading configs and plugins. " +
    "Defaults to the value of BABEL_ENV, or else NODE_ENV, or else 'development'."
);
program.option(
  "--root-mode [mode]",
  "The project-root resolution mode. " +
    "One of 'root' (the default), 'upward', or 'upward-optional'."
);

program.option("--source-type [script|module]", "");
program.option("--no-babelrc", "Whether or not to look up .babelrc and .babelignore files.");
program.option("--ignore [list]", "List of glob paths to **not** compile.");
program.option("--only [list]", "List of glob paths to **only** compile.");

program.option(
  "--no-highlight-code",
  "Enable or disable ANSI syntax highlighting of code frames. (on by default)"
);

program.option("--no-comments", "Write comments to generated output. (true by default)");
program.option("--retain-lines", "Retain line numbers. This will result in really ugly code.");
program.option(
  "--compact [true|false|auto]",
  "Do not include superfluous whitespace characters and line terminators."
);
program.option("--minified", "Save as many bytes when printing. (false by default)");
program.option(
  "--auxiliary-comment-before [string]",
  "Print a comment before any injected non-user code."
);
program.option(
  "--auxiliary-comment-after [string]",
  "Print a comment after any injected non-user code."
);

program.option("-s, --source-maps [true|false|inline|both]", "");
program.option("--source-map-target [string]", "Set `file` on returned source map.");
program.option("--source-file-name [string]", "Set `sources[0]` on returned source map.");
program.option("--source-root [filename]", "The root from which all sources are relative.");

program.option(
  "-x, --extensions [extensions]",
  `List of extensions to compile when a directory has been the input. [${[
    "js",
    "ts",
    "jsx",
    "tsx",
  ].join()}]`
);
program.option("--keep-file-extension", "Preserve the file extensions of the input files.");
program.option("-w, --watch", "Recompile files on changes.");
program.option("--skip-initial-build", "Do not compile files before watching.");
program.option("-o, --out-file [out]", "Compile all input files into a single file.");
program.option(
  "-d, --out-dir [out]",
  "Compile an input directory of modules into an output directory."
);
program.option(
  "--relative",
  "Compile into an output directory relative to input directory or file. Requires --out-dir [out]"
);

program.option("-D, --copy-files", "When compiling a directory copy over non-compilable files.");
program.option(
  "--include-dotfiles",
  "Include dotfiles when compiling and copying non-compilable files."
);
program.option("--no-copy-ignored", "Exclude ignored files when copying non-compilable files.");

program.option("--verbose", "Log everything. This option conflicts with --quiet");
program.option("--quiet", "Don't log anything. This option conflicts with --verbose");
program.option("--delete-dir-on-start", "Delete the out directory before compilation.");
program.option("--out-file-extension [string]", "Use a specific extension for the output files");

program.version("7.15.0");
program.usage("[options] <files ...>");

addCompletionSpecCommand(program);
