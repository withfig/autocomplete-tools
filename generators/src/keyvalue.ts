/** Suggestions to be displayed for keys or values */
export type KeyValueSuggestions =
  | string[]
  | Fig.Suggestion[]
  | NonNullable<Fig.Generator["custom"]>;

/** @deprecated use `KeyValueSuggestions` */
export type Suggestions = KeyValueSuggestions;

export type CacheValue = boolean | "keys" | "values";

export interface KeyValueInit {
  /** String to use as the separator between keys and values */
  separator?: string;

  /** List of key suggestions */
  keys?: KeyValueSuggestions;

  /** List of value suggestions */
  values?: KeyValueSuggestions;

  /** Cache key and value suggestions */
  cache?: CacheValue;
}

export interface KeyValueListInit {
  /** String to use as the separator between keys and values */
  separator?: string;

  /** String to use as the separator between key-value pairs */
  delimiter?: string;

  /** List of key suggestions */
  keys?: KeyValueSuggestions;

  /** List of value suggestions */
  values?: KeyValueSuggestions;

  /** Cache key and value suggestions */
  cache?: CacheValue;
}

/** Cache of Fig suggestions using the string[]/Suggestion[]/function as a key */
const suggestionCache = new Map<KeyValueSuggestions, Fig.Suggestion[]>();

async function kvSuggestionsToFigSuggestions(
  suggestions: KeyValueSuggestions,
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
  suggestions: KeyValueSuggestions,
  useSuggestionCache: boolean,
  init: Parameters<NonNullable<Fig.Generator["custom"]>>
): Promise<Fig.Suggestion[]> {
  if (useSuggestionCache) {
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

function shouldUseCache(isKey: boolean, cache: CacheValue) {
  if (typeof cache === "string") {
    return (isKey && cache === "keys") || (!isKey && cache === "values");
  }
  return cache;
}

/** Get the final index of any of the strings */
function lastIndexOf(haystack: string, ...needles: string[]) {
  return Math.max(...needles.map((needle) => haystack.lastIndexOf(needle)));
}

/**
 * Create a generator that gives suggestions for key=value arguments. You
 * can use a `string[]` or `Fig.Suggestion[]` for the keys and values.

 * You can set `cache: true` to enable caching results. The suggestions are cached
 * globally using the function as a key, so enabling caching for any one generator
 * will set the cache values for the functions for the entire spec. This behavior
 * can be used to copmpose expensive key/value generators without incurring the
 * initial cost every time they're used.
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
    getQueryTerm: (token) => token.slice(token.indexOf(separator) + 1),
    custom: async (...init) => {
      const [tokens] = init;
      const finalToken = tokens[tokens.length - 1];
      const isKey = !finalToken.includes(separator);
      const useCache = shouldUseCache(isKey, cache);
      return getSuggestions(isKey ? keys : values, useCache, init);
    },
  };
}

/**
 * Create a generator that gives suggestions for `k=v,k=v,...` arguments. You
 * can use a `string[]` or `Fig.Suggestion[]` for the keys and values.
 *
 * You can set `cache: true` to enable caching results. The suggestions are cached
 * globally using the function as a key, so enabling caching for any one generator
 * will set the cache values for the functions for the entire spec. This behavior
 * can be used to copmpose expensive key/value generators without incurring the
 * initial cost every time they're used.
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
      const newTokenIdx = lastIndexOf(newToken, separator, delimiter);
      const oldTokenIdx = lastIndexOf(oldToken, separator, delimiter);
      return newTokenIdx !== oldTokenIdx;
    },
    getQueryTerm: (token) => {
      const index = lastIndexOf(token, separator, delimiter);
      return token.slice(index + 1);
    },
    custom: async (...init) => {
      const [tokens] = init;

      const finalToken = tokens[tokens.length - 1];
      const index = lastIndexOf(finalToken, separator, delimiter);
      const isKey = index === -1 || finalToken.slice(index, index + separator.length) !== separator;

      const useCache = shouldUseCache(isKey, cache);
      return getSuggestions(isKey ? keys : values, useCache, init);
    },
  };
}
