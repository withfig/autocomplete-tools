function difference<T>(lhs: Set<T>, rhs: Array<T>): Set<T> {
  const newSet = new Set(lhs);
  for (const element of rhs) {
    newSet.delete(element);
  }
  return newSet;
}

export const defaultPreset = new Set([
  "icon",
  "displayName",
  "insertValue",
  "isDangerous",
  "priority",
  "hidden",
  // subcommand props
  "generators",
  "additionalSuggestions",
  "loadSpec",
  "generateSpec",
  "parserDirectives",
  // option props
  "isPersistent",
  "requiresEquals",
  "isRepeatable",
  "exclusiveOn",
  "dependsOn",
  // argument props
  "suggestions",
  "template",
  "generators",
  "optionsCanBreakVariadicArg",
  "isCommand",
  "isModule",
  "isScript",
  "debounce",
  "default",
]);

export const presets = {
  // this is a new Set identical to the default one that automatically excludes all the properties specified
  commander: difference(defaultPreset, [
    "description",
    "isOptional",
    "isVariadic",
    "default",
    "isRequired",
    "suggestions",
    "args",
  ]),
};

export type PresetName = keyof typeof presets;
