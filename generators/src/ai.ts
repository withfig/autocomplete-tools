export type GeneratorFn<T> = (args: {
  tokens: string[];
  executeCommand: Fig.ExecuteCommandFunction;
  generatorContext: Fig.GeneratorContext;
}) => Promise<T> | T;

const MAX_TOKENS = 4097;
const TOKEN_TO_CHAR_RATIO = 4;
const MARGIN_RATIO = 0.8;
const MAX_CHARS = MAX_TOKENS * TOKEN_TO_CHAR_RATIO * MARGIN_RATIO;

/**
 * A generator that uses the Fig AI API to generate suggestions.
 *
 * @param prompt The prompt to use for the AI. Can be a string or a generator function.
 * @param message The message to send to the AI. Can be a string or a generator function.
 * @param postProcess A function to post-process the AI's response.
 * @param temperature The temperature to use for the AI.
 * @returns A Fig generator.
 */
export function ai({
  name,
  prompt,
  message,
  postProcess,
  temperature,
  splitOn,
}: {
  name: string;
  prompt?: string | GeneratorFn<string>;
  message: string | GeneratorFn<string | null> | null;
  postProcess?: (out: string) => Fig.Suggestion[];
  temperature?: number;
  splitOn?: string;
}): Fig.Generator {
  return {
    scriptTimeout: 15000,
    custom: async (tokens, executeCommand, generatorContext) => {
      const settingOutput = await executeCommand({
        command: "fig",
        args: ["settings", "--format", "json", "autocomplete.ai.enabled"],
      });

      if (!JSON.parse(settingOutput.stdout)) {
        return [];
      }

      const promptString =
        typeof prompt === "function"
          ? await prompt({
              tokens,
              executeCommand,
              generatorContext,
            })
          : prompt;

      const messageString =
        typeof message === "function"
          ? await message({
              tokens,
              executeCommand,
              generatorContext,
            })
          : message;

      if (messageString === null || messageString.length === 0) {
        console.warn("No message provided to AI generator");
        return [];
      }

      const budget = MAX_CHARS - (promptString?.length ?? 0);

      const body = {
        model: "gpt-3.5-turbo",
        source: "autocomplete",
        name,
        messages: [
          ...(promptString
            ? [
                {
                  role: "system",
                  content: promptString,
                },
              ]
            : []),
          {
            role: "user",
            content: messageString.slice(0, budget),
          },
        ],
        temperature,
      };

      const bodyJson = JSON.stringify(body);

      const requestOutput = await executeCommand({
        command: "fig",
        args: ["_", "request", "--route", "/ai/chat", "--method", "POST", "--body", bodyJson],
      });
      const json = JSON.parse(requestOutput.stdout);

      const a =
        json?.choices
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => c?.message?.content)
          .filter((c: unknown) => typeof c === "string")
          .flatMap((c: string) =>
            splitOn ? c.split(splitOn).filter((s) => s.trim().length > 0) : [c]
          )
          .map((out: string) => {
            if (postProcess) {
              return postProcess(out);
            }
            const text = out.trim().replace(/\n/g, " ");
            return {
              icon: "🪄",
              name: text,
              insertValue: `'${text}'`,
              description: "Generated by Fig AI",
            } as Fig.Suggestion;
          }) ?? [];

      return a;
    },
  };
}
