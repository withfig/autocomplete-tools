export enum ValidationErrorEnum {
  nameWithSpace = "The `name` option must not contain spaces",
}

export enum GenericErrorEnum {
  noSpecPassed = "`specPath` option was not defined and the binary did not send any completion spec to stdout",
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
