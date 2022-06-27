import type prompts from "prompts";
import type { RunOptions } from "../types";

export type SingleOrArray<T> = T | T[];

export type PromptsName<Q> = prompts.PromptObject<Extract<keyof Q, string> & string>;

// when a value is returned
export type ValueValidationResult<Q> = [value: Q, questions: undefined];
// when questions are returned
export type QuestionsValidationResult<Q> = [value: undefined, questions: PromptsName<Q>[]];
export type ValidationResult<Q> = ValueValidationResult<Q> | QuestionsValidationResult<Q>;

export type Validator<Q> = (options: RunOptions) => Promise<ValidationResult<Q>>;
