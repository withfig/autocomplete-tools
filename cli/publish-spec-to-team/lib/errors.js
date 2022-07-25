export var ValidationErrorEnum;
(function (ValidationErrorEnum) {
    ValidationErrorEnum["nameWithSpace"] = "The `name` option must not contain spaces";
    ValidationErrorEnum["missingToken"] = "We tried to search for a token in fig configs, but we found none. Use the `token` option to specify one";
})(ValidationErrorEnum || (ValidationErrorEnum = {}));
export var GenericErrorEnum;
(function (GenericErrorEnum) {
    GenericErrorEnum["noSpecPassed"] = "No spec was received. The `spec-path` option was not defined and the binary did not send any completion spec to stdout";
    GenericErrorEnum["missingName"] = "Missing name. Nither the `name` option or the `spec-path` option need to be passed to the program";
})(GenericErrorEnum || (GenericErrorEnum = {}));
const createErrorClass = (name) => class extends Error {
    constructor(message) {
        super(message);
        this.name = name;
    }
};
export const GenerationError = createErrorClass("GenerationError");
export const ValidationError = createErrorClass("ValidationError");
export const BuildError = createErrorClass("BuildError");
export const PublishError = createErrorClass("PublishError");
