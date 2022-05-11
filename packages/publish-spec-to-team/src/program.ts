import { Command } from "commander";
import { run } from "./index.js";
import packageJSON from "./package.js";

const program = new Command()
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description("Publish a spec to fig teams");

program
  .option("-t, --token <string>", "A fig token")
  .option("--team", "Set the namespace of the published spec")
  .option("-n, --name <string>", "Set the name of the published spec")
  .option("-p, --spec-path <path>", "The local path of the spec to publish")
  .option("-b, --binary-path <path>", "The path of the binary to run to generate the spec")
  .option(
    "-s, --subcommand-name <string>",
    "The subcommand of the binary used to generate the spec"
  )
  .option("-f, --framework <string>", "Framework used to build the CLI")
  .action(run);

export { program };
