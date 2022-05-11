export interface FilepathsOptions {
  /** Show suggestions with any of these extensions. Do not include the leading dot. */
  extensions?: string[];
  /** Show suggestions where the name exactly matches one of these strings */
  equals?: string | string[];
  /** Show suggestions where the name matches this expression */
  matches?: RegExp;
  /**
   * Defines how folders are suggested.
   *
   * - **Default:** `always` will always suggest folders.
   * - `filter` will treat folders like files, filtering based on the name.
   * - `never` will never suggest folders.
   */
  suggestFolders?: "filter" | "always" | "never";
  /**
   * Set properties of suggestions of type "file".
   */
  editFileSuggestions?: Omit<Fig.Suggestion, "name" | "type">;
  /**
   * Set properties of suggestions of type "folder".
   */
  editFolderSuggestions?: Omit<Fig.Suggestion, "name" | "type">;
}

/**
 * Sugar over using the `filepaths` template with `filterTemplateSuggestions`. If any of the
 * conditions match, the suggestion will be accepted.
 *
 * Basic filepath filters can be replaced with this generator.
 *
 * @example
 * ```
 * // inside a `Fig.Arg`...
 * generators: filepaths({ extensions: ["mjs", "js", "json"] });
 * ```
 */
export function filepaths(options: FilepathsOptions): Fig.Generator {
  const {
    extensions = [],
    equals = [],
    matches,
    suggestFolders = "always",
    editFileSuggestions,
    editFolderSuggestions,
  } = options;
  const extensionsSet = new Set(extensions);
  const equalsSet = new Set(equals);
  return {
    template: "filepaths",
    filterTemplateSuggestions: (suggestions = []) => {
      const filtered = suggestions.filter(({ name = "", type }) => {
        if (suggestFolders !== "filter" && type === "folder") {
          return suggestFolders === "always";
        }
        if (equalsSet.has(name)) return true;
        // We need to explicitly create a new Regexp object here or it will not work. Why?
        if (matches && new RegExp(matches.source, matches.flags).test(name)) return true;
        // handle extensions
        const [_, ...suggestionExtensions] = name.split(".");
        if (suggestionExtensions.length >= 1) {
          let i = suggestionExtensions.length - 1;
          let stackedExtensions = suggestionExtensions[i];
          do {
            if (extensionsSet.has(stackedExtensions)) {
              return true;
            }
            i -= 1;
            // `i` may become -1 which is not a valid index, but the extensionSet check at the beginning is not run in that case,
            // so the wrong extension is not evaluated
            stackedExtensions = [suggestionExtensions[i], stackedExtensions].join(".");
          } while (i >= 0);
        }
        return false;
      });
      if (!editFileSuggestions && !editFolderSuggestions) return filtered;

      return filtered.map((suggestion) => ({
        ...suggestion,
        ...((suggestion.type === "file" ? editFileSuggestions : editFolderSuggestions) || {}),
      }));
    },
  };
}
