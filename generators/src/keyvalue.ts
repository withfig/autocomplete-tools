/** Suggestions to be displayed for keys or values */
export type Suggestions = string[] | Fig.Suggestion[] | NonNullable<Fig.Generator["custom"]>;

export interface KeyValueInit {
  /** String to use as the separator between keys and values */
  separator?: string;

  /** List of key suggestions */
  keys?: Suggestions;

  /** List of value suggestions */
  values?: Suggestions;

  /** Cache key and value suggestions */
  cache?: boolean;
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

  /** Cache key and value suggestions */
  cache?: boolean;
}

/** Cache of Fig suggestions using the string[]/Suggestion[]/function as a key */
const suggestionCache = new Map<Suggestions, Fig.Suggestion[]>();

async function kvSuggestionsToFigSuggestions(
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

async function getSuggestions(
  suggestions: Suggestions,
  cache: boolean,
  init: Parameters<NonNullable<Fig.Generator["custom"]>>
): Promise<Fig.Suggestion[]> {
  if (cache) {
    if (!suggestionCache.has(suggestions)) {
      suggestionCache.set(suggestions, await kvSuggestionsToFigSuggestions(suggestions, init));
    }
    // We've already ensured that the value is definitely in the cache,
    // there can be no TOCTTOU bugs because JS is single threaded
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return suggestionCache.get(suggestions)!;
  }
  return kvSuggestionsToFigSuggestions(suggestions, init);
}

/**
 * Create a generator that gives suggestions for key=value arguments. You
 * can use a `string[]` or `Fig.Suggestion[]` for the keys and values.
 *
 * @example
 *
 * ```typescript
 * // set-values a=1 b=3 c=2
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
 * @example The separator between keys and values can be customized (default: `=`)
 *
 * ```typescript
 * // key1:value
 * keyValue({
 *   separator: ":",
 *   keys: [
 *     { name: "key1", icon: "fig://icon?type=string" },
 *     { name: "key2", icon: "fig://icon?type=string" },
 *   ],
 * }),
 * ```
 */
export function keyValue({
  separator = "=",
  keys = [],
  values = [],
  cache = false,
}: KeyValueInit): Fig.Generator {
  return {
    trigger: (newToken, oldToken) => newToken.indexOf(separator) !== oldToken.indexOf(separator),
    getQueryTerm: (token) => (token as string).slice((token as string).indexOf(separator) + 1),
    custom: async (...init) => {
      const [tokens] = init;
      const finalToken = tokens[tokens.length - 1];
      const isKey = !finalToken.includes(separator);
      return getSuggestions(isKey ? keys : values, cache, init);
    },
  };
}

function getFinalSepDelimIndex(sep: string, delim: string, token: string): number {
  return Math.max(token.lastIndexOf(sep), token.lastIndexOf(delim));
}

/**
 * Create a generator that gives suggestions for `k=v,k=v,...` arguments. You
 * can use a `string[]` or `Fig.Suggestion[]` for the keys and values.
 *
 * @example
 *
 * ```typescript
 * // set-values a=1,b=3,c=2
 * const spec: Fig.Spec = {
 *   name: "set-values",
 *   args: {
 *     name: "values",
 *     generators: keyValueList({
 *       keys: ["a", "b", "c"],
 *       values: ["1", "2", "3"],
 *     }),
 *   },
 * }
 * ```
 *
 * @example
 *
 * The separator between keys and values can be customized. It's `=` by
 * default. You can also change the key/value pair delimiter, which is `,`
 * by default.
 *
 * ```typescript
 * // key1:value&key2=another
 * keyValue({
 *   separator: ":",
 *   delimiter: "&"
 *   keys: [
 *     { name: "key1", icon: "fig://icon?type=string" },
 *     { name: "key2", icon: "fig://icon?type=string" },
 *   ],
 * }),
 * ```
 */
export function keyValueList({
  separator = "=",
  delimiter = ",",
  keys = [],
  values = [],
  cache = false,
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
      return getSuggestions(isKey ? keys : values, cache, init);
    },
  };
}
