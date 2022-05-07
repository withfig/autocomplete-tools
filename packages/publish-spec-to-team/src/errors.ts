export enum ValidationErrorEnum {
  nameWithSpace = "The `name` option must not contain spaces",
}

export enum GenericErrorEnum {
  noSpecPassed = "`specPath` option was not defined and the binary did not send any completion spec to stdout",
  missingName = "Either the `name` option or the `spec-path` option need to be passed to the program",
}

const createErrorClass = (name: string) =>
  class extends Error {
    constructor(message: string) {
      super(message);
      this.name = name;
    }
  };

export const ValidationError = createErrorClass("ValidationError");
export const BuildError = createErrorClass("ValidationError");
export const PublishError = createErrorClass("ValidationError");
