export const Errors = {
  MissingDefaultExport: (file: string) =>
    new Error(`A Fig spec file should \`export default\` a completion spec object (file: ${file})`),
  NoDirectDefaultExport: (file: string) =>
    new Error(
      `The completion spec object should not be default exported directly, but it needs to be assigned to a variable before (file: ${file})`
    ),
  DefaultExportShouldBeAnIdentifier: (file: string) =>
    new Error(
      `The default export of a Fig spec file should be an identifier referencing the completion spec object (file: ${file})`
    ),
  MissingSpecVariableDeclaration: (file: string) =>
    new Error(
      `The spec file must contain exactly one variable declaration containing the spec object (file: ${file})`
    ),
} as const;
