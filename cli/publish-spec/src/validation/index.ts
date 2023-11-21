import prompts from "prompts";
import type { RunOptions } from "../types";
import type { Validator } from "./types";

export * from "./validators/index.js";

interface Chainable<T = Record<string, never>> {
  validator<V>(val: Validator<V>): Chainable<T & V>;
  exec(): Promise<T>;
}

/**
 * `Validate` performs some validation logic sequencially each time returning the validated and sanitized option
 * If interactive mode is run validate also creates a prompt queue that will get executed to ask options to the user in real time
 * > NOTE: Order of validators in the chain matters!
 */
export function validate(options: RunOptions): Chainable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validators: Validator<any>[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function exec(): Promise<any> {
    const interactiveQuestions: prompts.PromptObject<string>[] = [];
    const validatedOptions = {};

    const validated = await Promise.all(validators.map((v) => v(options)));

    for (const item of validated) {
      const [d, q] = item;
      if (q) {
        interactiveQuestions.push(...q);
      } else {
        Object.assign(validatedOptions, d);
      }
    }

    if (interactiveQuestions.length > 0) {
      const questionsResponse = await prompts(interactiveQuestions);
      Object.assign(validatedOptions, questionsResponse);
    }

    return validatedOptions;
  }

  function validator<T>(val: Validator<T>) {
    validators.push(val);
    return {
      validator,
      exec,
    };
  }

  return {
    validator,
    exec,
  };
}
