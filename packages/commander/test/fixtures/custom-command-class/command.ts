/* eslint-disable class-methods-use-this */
import { Command } from "commander";
import { addCompletionSpecCommand } from "../../../src";

class CommandWithTrace extends Command {
  createCommand(name: string) {
    const cmd = new Command(name);

    cmd.option("-t, --trace", "display extra information when run command");
    return cmd;
  }
}

const program = new CommandWithTrace("program").option("-v, ---verbose");

program.command("serve [params...]").option("-p, --port <number>", "port number");

program.command("build <target>");

addCompletionSpecCommand(program);
