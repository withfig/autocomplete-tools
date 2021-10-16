/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Argument, Command, Option } from "commander";
import { writeFileSync } from "fs";
import path from "path";
import prettier from "prettier";

export interface Options {
  cwd?: string;
}

function convertDefaultValue(v: unknown) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join(",");
  return String(v);
}

function getTemplate(spec: Fig.Spec): string {
  return prettier.format(
    `
    // Autogenerated by @withfig/commander

    const completionSpec: Fig.Spec = ${JSON.stringify(spec)}

    export default completionSpec;
  `,
    { parser: "typescript" }
  );
}

function generateArg(_arg: Argument & Record<string, any>): Fig.Arg {
  const { _name: name, description, required, variadic, defaultValue } = _arg;

  const arg: Fig.Arg = { name };

  if (description) arg.description = description;
  if (!required) arg.isOptional = true;
  if (variadic) arg.isVariadic = true;
  if (defaultValue) arg.default = convertDefaultValue(defaultValue);
  return arg;
}

function generateOption(_option: Option & Record<string, any>): Fig.Option {
  const {
    short,
    long,
    flags,
    description,
    mandatory,
    required,
    optional,
    variadic,
    argChoices,
    defaultValue,
  } = _option;

  const name = [];
  if (short) name.push(short);
  if (long) name.push(long);
  const option: Fig.Option = { name };

  if (description) option.description = description;
  if (mandatory) option.isRequired = true;
  // Option argument e.g. "-f, --flag <string>"
  // If required and optional are both false it does not have an argument
  if (required || optional) {
    // eslint-disable-next-line no-useless-escape
    const matches = flags.match(/.*[\[<](.*)[\]>]/); // !!! This is all but an useless escape. It is required to make the regex working

    const arg: Fig.Arg = {
      name: matches ? matches[1].replace(/\./g, "") : "",
    };
    if (optional) arg.isOptional = true;
    if (variadic) arg.isVariadic = true;
    if (argChoices) arg.suggestions = argChoices;
    if (defaultValue) arg.default = convertDefaultValue(defaultValue);
    option.args = arg;
  }
  return option;
}

interface ExtendedCommand extends Command {
  _name: string;
  _description: string;
  _aliases: string[];
  _args: Argument[];
  options: Option[];
  _helpDescription: string;
  _helpShortFlag: string;
  _helpLongFlag: string;
  _addImplicitHelpCommandL?: boolean; // Deliberately undefined, not decided whether true or false
  _helpCommandName: string;
  _helpCommandnameAndArgs: string;
  _helpCommandDescription: string;
  _hasHelpOption: boolean;
}

function helpSubcommand({
  _helpCommandName, // 'help'
  _helpCommandDescription,
  _helpCommandnameAndArgs, // 'help [cmd]'
}: ExtendedCommand): Fig.Option {
  return {
    name: _helpCommandName,
    description: _helpCommandDescription,
    priority: 49,
    args: {
      name: _helpCommandnameAndArgs.split(" ")[1].slice(1, -1),
      isOptional: true,
    },
  };
}

function helpOption({
  _helpDescription,
  _helpShortFlag,
  _helpLongFlag,
}: ExtendedCommand): Fig.Option {
  return {
    name: [_helpShortFlag, _helpLongFlag],
    description: _helpDescription,
    priority: 49,
  };
}

function generateCommand(_command: Command & Record<string, any>): Fig.Subcommand {
  const {
    _name,
    _description,
    _aliases,
    commands,
    _args,
    options,
    _addImplicitHelpCommandL,
    _hasHelpOption,
  } = _command as ExtendedCommand;

  const name = _aliases.length > 0 ? [_name, ..._aliases] : _name;
  const command: Fig.Subcommand = { name };

  if (_description) command.description = _description;
  // Subcommands
  if (commands.length) {
    command.subcommands = commands.map(generateCommand);
    if (_addImplicitHelpCommandL !== false) {
      command.subcommands.push(helpSubcommand(_command as ExtendedCommand));
    }
  }
  // Options
  command.options = [];
  if (options.length) {
    command.options = options.map(generateOption);
  }
  if (_hasHelpOption) {
    command.options.push(helpOption(_command as ExtendedCommand));
  }
  // Args
  if (_args.length) {
    command.args = _args.map(generateArg);
  }
  return command;
}

export function generateFigSpec(command: Command, filename: string, options?: Options): Command {
  const cwd = options?.cwd || process.cwd();
  const spec = generateCommand(command);
  writeFileSync(path.resolve(cwd, filename), getTemplate(spec));
  return command;
}