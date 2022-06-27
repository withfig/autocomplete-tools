import type {
  ValueValidationResult,
  QuestionsValidationResult,
  SingleOrArray,
  PromptsName,
} from "../types";

export function value<T>(v: T): ValueValidationResult<T> {
  return [v, undefined];
}

export function questions<V>(q: SingleOrArray<PromptsName<V>>): QuestionsValidationResult<V> {
  return [undefined, Array.isArray(q) ? q : [q]];
}
