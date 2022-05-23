export interface KeyValueInit {
  key:
    | Fig.Suggestion[]
    | ((
        tokens: string[],
        executeShellCommand: Fig.ExecuteShellCommandFunction
      ) => Promise<Fig.Suggestion[]>);
  sep: string;
  value:
    | Fig.Suggestion[]
    | ((
        tokens: string[],
        executeShellCommand: Fig.ExecuteShellCommandFunction
      ) => Promise<Fig.Suggestion[]>);
}

export interface KeyValueListInit extends KeyValueInit {
  delim: string;
}

export function keyvalue({ key, sep, value }: KeyValueInit): Fig.Generator {
  return {
    trigger: (newToken, oldToken) => newToken.indexOf(sep) !== oldToken?.indexOf(sep),
    getQueryTerm: (token) => (token as string).slice((token as string).indexOf(sep) + 1),
    custom: async (tokens, executeShellCommand) => {
      const finalToken = tokens[tokens.length - 1];
      const isKey = !finalToken.includes(sep);

      if (isKey) {
        if (typeof key === "function") {
          return key(tokens, executeShellCommand);
        }
        return key;
      }

      if (typeof value === "function") {
        return value(tokens, executeShellCommand);
      }
      return value;
    },
  };
}

function getFinalSepDelimIndex(sep: string, delim: string, token: string): number {
  const sepIdx = token.lastIndexOf(sep);
  const delimIdx = token.lastIndexOf(delim);
  return Math.max(sepIdx, delimIdx);
}

export function keyvaluelist({ key, sep, value, delim }: KeyValueListInit): Fig.Generator {
  return {
    trigger: (newToken, oldToken) => {
      const newTokenIdx = getFinalSepDelimIndex(sep, delim, newToken);
      const oldTokenIdx = getFinalSepDelimIndex(sep, delim, oldToken as string);
      return newTokenIdx !== oldTokenIdx;
    },
    getQueryTerm: (token) => {
      const index = getFinalSepDelimIndex(sep, delim, token as string);
      return (token as string).slice(index + 1);
    },
    custom: async (tokens, executeShellCommand) => {
      const finalToken = tokens[tokens.length - 1];
      const index = getFinalSepDelimIndex(sep, delim, finalToken);
      const isKey = index === -1 || finalToken.slice(index, index + sep.length) !== sep;

      if (isKey) {
        if (typeof key === "function") {
          return key(tokens, executeShellCommand);
        }
        return key;
      }

      if (typeof value === "function") {
        return value(tokens, executeShellCommand);
      }
      return value;
    },
  };
}
