import { Command } from "commander";
import { run } from "./run.js";
import packageJSON from "./package.js";

const program = new Command()
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description("Publish a spec to fig teams");

program
  .option("-i, --interactive", "Publish a spec interactively")
  .option("-t, --token <string>", "A fig token")
  .option("--team <string>", "Set the namespace of the published spec")
  .option("-n, --name <string>", "Set the name of the published spec")
  .option("-p, --spec-path <path>", "The local path of the spec to publish")
  .option("-b, --binary-path <path>", "The path of the binary to run to generate the spec")
  .option(
    "-s, --subcommand-name <string>",
    "The subcommand of the binary used to generate the spec"
  )
  .option(
    "--is-script",
    "The spec is a local script and will only be loaded when referenced in a fig/config.json file."
  )
  .option("-f, --framework <string>", "Framework used to build the CLI")
  .action(run);

export { program };
