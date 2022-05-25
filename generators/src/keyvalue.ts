/** Suggestions to be displayed for keys or values */
export type Suggestions =
  | string[]
  | Fig.Suggestion[]
  | ((
      tokens: string[],
      executeShellCommand: Fig.ExecuteShellCommandFunction,
      shellContext: Fig.ShellContext
    ) => Fig.Suggestion[] | Promise<Fig.Suggestion[]>);

export interface KeyValueInit {
  /** String to use as the separator between keys and values */
  separator?: string;

  /** List of key suggestions */
  keys?: Suggestions;

  /** List of value suggestions */
  values?: Suggestions;
}

export interface KeyValueListInit {
  /** String to use as the separator between keys and values */
  separator?: string;

  /** String to use as the separator between key-value pairs */
  delimiter?: string;

  /** List of key suggestions */
  keys?: Suggestions;

  /** List of value suggestions */
  values?: Suggestions;
}

async function resultsToSuggestions(
  suggestions: Suggestions,
  init: Parameters<NonNullable<Fig.Generator["custom"]>>
): Promise<Fig.Suggestion[]> {
  if (typeof suggestions === "function") {
    return suggestions(...init);
  }
  if (typeof suggestions[0] === "string") {
    return (suggestions as string[]).map((name) => ({ name }));
  }
  return suggestions as Fig.Suggestion[];
}

/**
 * Create a generator that gives suggestions for key=value arguments. You
 * can use a `string[]` or `Fig.Suggestion[]` for the
 *
 * ```typescript
 * const spec: Fig.Spec = {
 *   name: "set-values",
 *   args: {
 *     name: "values",
 *     isVariadic: true,
 *     generators: keyValue({
 *       keys: ["a", "b", "c"],
 *       values: ["1", "2", "3"],
 *     }),
 *   },
 * }
 * ```
 *
 * The separator between keys and values can be customized. It's `=` by
 * default.
 *
 * ```typescript
 * keyValue({
 *   separator: ":",
 *   keys: [
 *     { name: "key1", icon: "fig://icon?type=string" },
 *     { name: "key2", icon: "fig://icon?type=string" },
 *   ],
 * }),
 * ```
 */
export function keyValue({ separator = "=", keys = [], values = [] }: KeyValueInit): Fig.Generator {
  return {
    trigger: (newToken, oldToken) => newToken.indexOf(separator) !== oldToken.indexOf(separator),
    getQueryTerm: (token) => (token as string).slice((token as string).indexOf(separator) + 1),
    custom: async (...init) => {
      const [tokens] = init;
      const finalToken = tokens[tokens.length - 1];
      const isKey = !finalToken.includes(separator);
      if (isKey) {
        return resultsToSuggestions(keys, init);
      }
      return resultsToSuggestions(values, init);
    },
  };
}

function getFinalSepDelimIndex(sep: string, delim: string, token: string): number {
  return Math.max(token.lastIndexOf(sep), token.lastIndexOf(delim));
}

export function keyValueList({
  separator = "=",
  delimiter = ",",
  keys = [],
  values = [],
}: KeyValueListInit): Fig.Generator {
  return {
    trigger: (newToken, oldToken) => {
      const newTokenIdx = getFinalSepDelimIndex(separator, delimiter, newToken);
      const oldTokenIdx = getFinalSepDelimIndex(separator, delimiter, oldToken);
      return newTokenIdx !== oldTokenIdx;
    },
    getQueryTerm: (token) => {
      const index = getFinalSepDelimIndex(separator, delimiter, token as string);
      return (token as string).slice(index + 1);
    },
    custom: async (...init) => {
      const [tokens] = init;
      const finalToken = tokens[tokens.length - 1];
      const index = getFinalSepDelimIndex(separator, delimiter, finalToken);
      const isKey = index === -1 || finalToken.slice(index, index + separator.length) !== separator;
      if (isKey) {
        return resultsToSuggestions(keys, init);
      }
      return resultsToSuggestions(values, init);
    },
  };
}
