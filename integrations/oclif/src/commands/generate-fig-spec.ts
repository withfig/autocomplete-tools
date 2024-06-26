import { Command } from "@oclif/core";
import * as fs from "node:fs";
import * as prettier from "prettier";

function getFigArgs(args: Command.Arg.Cached[]): Fig.Arg[] {
  const figArgs: Fig.Arg[] = [];
  for (const arg of args) {
    if (arg.hidden) continue;
    figArgs.push({
      name: arg.name,
      ...(arg.description && { description: arg.description }),
      ...(arg.default && { default: `${arg.default}` }),
      ...(arg.options?.length && { suggestions: arg.options }),
      ...(arg.required === false && { isOptional: true }),
    });
  }
  return figArgs;
}

function getFigOptions(options: Command.Flag.Cached[]): Fig.Option[] {
  const figOptions: Fig.Option[] = [];
  for (const flag of options) {
    figOptions.push({
      name: flag.char ? [`-${flag.char}`, `--${flag.name}`] : `--${flag.name}`,
      ...(flag.description && { description: flag.description }),
      ...(flag.type === "option" && {
        args: {
          description: flag.helpValue,
          ...(flag.options?.length && { suggestions: flag.options }),
          ...(flag.default && { default: `${flag.default}` }),
        },
      }),
      ...(flag.required === true && { isRequired: true }),
      ...(flag.type === "boolean" && flag.allowNo && { exclusiveOn: [`--no-${flag.name}`] }),
      hidden: flag.hidden,
    });
    if (flag.type === "boolean" && flag.allowNo) {
      figOptions.push({
        name: `--no-${flag.name}`,
      });
    }
  }
  return figOptions;
}

function getFigSubcommands(commands: Command.Loadable[]): Fig.Subcommand[] {
  const subcommands: Fig.Subcommand[] = [];
  for (const command of commands) {
    // skip this command
    if (command.id === "generate-fig-spec") continue;

    const options: Fig.Option[] = getFigOptions(Object.values(command.flags));
    const args: Fig.Arg[] = getFigArgs(Object.values(command.args));

    subcommands.push({
      name: command.id,
      ...(command.description && { description: command.description }),
      ...(options.length && { options }),
      ...(args.length && { args }),
      hidden: command.hidden,
    });
  }
  return subcommands;
}

export class GenerateFigSpecCommand extends Command {
  static description = "Generate a Fig completion spec";

  async run() {
    const { flags: parsedFlags } = await this.parse(GenerateFigSpecCommand);

    const spec: Fig.Spec = {
      name: this.config.name,
      subcommands: getFigSubcommands(this.config.commands),
    };

    const template = await prettier.format(
      `// Autogenerated by @fig/complete-oclif
  
      const completionSpec: Fig.Spec = ${JSON.stringify(spec)};
  
      export default completionSpec;
    `,
      { parser: "typescript" }
    );

    if (parsedFlags.output) {
      fs.writeFileSync(parsedFlags.output, template);
    } else {
      this.log(template);
    }
  }
}
