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

function getKeyValueGeneratorFunction({ key, sep, value }: KeyValueInit): Fig.Generator["custom"] {
  return async (tokens, executeShellCommand) => {
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
  };
}

export function keyvalue(init: KeyValueInit): Fig.Generator {
  return {
    trigger: init.sep,
    getQueryTerm: init.sep,
    custom: getKeyValueGeneratorFunction(init),
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
      const lastPunctuationIdx = getFinalSepDelimIndex(sep, delim, token as string);
      return (token as string).slice(lastPunctuationIdx + 1);
    },
    custom: getKeyValueGeneratorFunction({ key, sep, value }),
  };
}
