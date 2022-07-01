// The presets in this file contain lists of props that are considered as updated
// automatically between a older spec and a new one, so every prop from the new one
// can override the one of the old one. All the props not contained here are overridden
// if and only if they are not present in the new spec at the same location

export type Preset = {
  commandProps: Set<string>;
  optionProps: Set<string>;
  argProps: Set<string>;
};

export function defaultPreset(): Preset {
  return {
    commandProps: new Set(["name", "description", "args", "subcommands", "options"]),
    optionProps: new Set(["name", "description", "args"]),
    argProps: new Set(["name", "description"]),
  };
}

export type PresetName =
  | "commander"
  | "oclif"
  | "cobra"
  | "clap"
  | "swift-argument-parser"
  | "click"
  | "cement"
  | "argparse";

const argparsePreset = {
  commandProps: new Set(["name", "subcommands", "options", "args", "hidden", "description"]),
  optionProps: new Set(["name", "hidden", "description", "isRepeatable", "args", "isRequired"]),
  argProps: new Set(["name", "isVariadic", "isOptional", "hidden", "description", "suggestion"]),
};

export const presets: Record<PresetName, Preset> = {
  commander: {
    commandProps: new Set(["name", "description", "subcommands", "options", "args", "hidden"]),
    optionProps: new Set(["name", "description", "isRequired", "args"]),
    argProps: new Set([
      "name",
      "description",
      "isOptional",
      "isVariadic",
      "suggestions",
      "default",
    ]),
  },
  oclif: {
    commandProps: new Set(["name", "description", "subcommands", "options", "args"]),
    optionProps: new Set(["name", "description", "isRequired", "args", "exclusiveOn"]),
    argProps: new Set(["name", "description", "isOptional", "suggestions", "default"]),
  },
  cobra: {
    commandProps: new Set(["name", "description", "subcommands", "options", "args"]),
    optionProps: new Set([
      "name",
      "description",
      "displayName",
      "isRepeatable",
      "isRequired",
      "args",
    ]),
    argProps: new Set(["name", "description", "template", "default"]),
  },
  clap: {
    commandProps: new Set(["name", "description", "subcommands", "options", "args", "hidden"]),
    optionProps: new Set([
      "name",
      "description",
      "args",
      "isRepeatable",
      "exclusiveOn",
      "hidden",
      "requiresEquals",
    ]),
    argProps: new Set(["name", "isVariadic", "isOptional", "suggestions", "template", "isCommand"]),
  },
  "swift-argument-parser": {
    commandProps: new Set(["name", "description", "subcommands", "options", "args"]),
    optionProps: new Set(["name", "isRequired", "isRepeatable", "description", "hidden"]),
    argProps: new Set(["name", "description", "default", "isVariadic", "isOptional"]),
  },
  click: {
    commandProps: new Set([
      "name",
      "description",
      "options",
      "subcommands",
      "args",
      "hidden",
      "deprecated",
    ]),
    optionProps: new Set([
      "name",
      "description",
      "isRepeatable",
      "isRequired",
      "exclusiveOn",
      "args",
    ]),
    argProps: new Set(["name", "suggestions", "template", "suggestCurrentToken", "isVariadic"]),
  },
  argparse: argparsePreset,
  cement: argparsePreset,
};
