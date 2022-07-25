/// <reference types="node" />
export declare enum ValidationErrorEnum {
    nameWithSpace = "The `name` option must not contain spaces",
    missingToken = "We tried to search for a token in fig configs, but we found none. Use the `token` option to specify one"
}
export declare enum GenericErrorEnum {
    noSpecPassed = "No spec was received. The `spec-path` option was not defined and the binary did not send any completion spec to stdout",
    missingName = "Missing name. Nither the `name` option or the `spec-path` option need to be passed to the program"
}
export declare const GenerationError: {
    new (message: string): {
        name: string;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare const ValidationError: {
    new (message: string): {
        name: string;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare const BuildError: {
    new (message: string): {
        name: string;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export declare const PublishError: {
    new (message: string): {
        name: string;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
