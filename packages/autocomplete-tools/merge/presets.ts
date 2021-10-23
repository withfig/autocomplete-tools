// The presets in this file contain lists of props that are considered as updated
// automatically between a older spec and a new one, so every prop from the new one
// can override the one of the old one. All the props not contained here are overridden
// if and only if they are not present in the new spec at the same location

export type Preset = {
  commandProps: Set<string>;
  optionProps: Set<string>;
  argProps: Set<string>;
};

export type PresetName = keyof typeof presets;

export const defaultPreset: Preset = {
  commandProps: new Set(["name", "description", "args", "subcommands", "options"]),
  optionProps: new Set(["name", "description", "args"]),
  argProps: new Set(["name", "description"]),
};

// export const defaultPreset = new Set([
//   "icon",
//   "displayName",
//   "insertValue",
//   "isDangerous",
//   "priority",
//   "hidden",
//   // subcommand props
//   "generators",
//   "additionalSuggestions",
//   "loadSpec",
//   "generateSpec",
//   "parserDirectives",
//   // option props
//   "isPersistent",
//   "requiresEquals",
//   "isRepeatable",
//   "exclusiveOn",
//   "dependsOn",
//   // argument props
//   "suggestions",
//   "template",
//   "generators",
//   "optionsCanBreakVariadicArg",
//   "isCommand",
//   "isModule",
//   "isScript",
//   "debounce",
//   "default",
// ]);

export const presets: Record<string, Preset> = {
  commander: {
    commandProps: new Set(["name", "description", "subcommands", "options", "args"]),
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
    commandProps: new Set(["name", "description", "subcommands", "options", "args"]),
    optionProps: new Set(["name", "description", "args"]),
    argProps: new Set(["name", "isVariadic", "isOptional", "suggestions", "template", "isCommand"]),
  },
};
