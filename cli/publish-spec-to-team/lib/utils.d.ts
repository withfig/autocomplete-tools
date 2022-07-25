export declare function exec(cmd: string): Promise<string>;
export declare function validateSpecName(name: string): void;
export declare function createFile(content: string, name: string): File;
export declare function createFileFrom(filePath: string, name: string): Promise<File>;
declare type CreateTempDirResult = [tempDirPath: string, cleanTempDirFn: () => Promise<void>];
export declare function createTempDir(rootDir: string): Promise<CreateTempDirResult>;
export {};
