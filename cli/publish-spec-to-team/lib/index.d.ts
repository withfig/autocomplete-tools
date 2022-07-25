export interface RunOptions {
    name?: string;
    team?: string;
    token?: string;
    specPath?: string;
    binaryPath?: string;
    subcommandName?: string;
    framework?: string;
}
export declare const run: (options: RunOptions) => Promise<void>;
