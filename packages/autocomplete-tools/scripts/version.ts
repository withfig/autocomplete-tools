import { Command } from "commander";
import semver from "semver";
import { applySpecDiff, diffSpecs } from "@fig/autocomplete-helpers";
import { importFromStringSync } from "module-from-string";
import prettier from "prettier";
import fs from "fs";
import ts from "typescript";

const visitFileNodes = (source: ts.SourceFile, visitor: ts.Visitor): ts.Node =>
  ts.transform(source, [
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      const visit = (node: ts.Node): ts.VisitResult<ts.Node> =>
        visitor(ts.visitEachChild(node, visit, context));
      return ts.visitNode(rootNode, visit);
    },
  ]).transformed[0];

const findInFile = <T>(source: ts.SourceFile, predicate: (node: ts.Node) => T | null): T[] => {
  const matches: T[] = [];
  visitFileNodes(source, (node: ts.Node) => {
    // Find a node like "export { versions };"
    const match = predicate(node);
    if (match !== null) {
      matches.push(match);
    }
    return node;
  });
  return matches;
};

const formatSource = (source: string | string[]) =>
  prettier.format(Array.isArray(source) ? source.join("\n") : source, {
    parser: "typescript",
    semi: false,
    singleQuote: true,
  });

const loadTypescriptModule = (path: string) => {
  const contents = fs.readFileSync(path).toString();
  const jsString = ts.transpile(contents);
  return importFromStringSync(jsString, {
    dirname: process.cwd(),
  });
};

const loadVersionedSpec = async (
  path: string,
  defaultSpec: Fig.Subcommand
): Promise<{
  source: string;
  spec: Fig.Subcommand;
  versions: Fig.VersionDiffMap;
}> => {
  if (!fs.existsSync(path)) {
    return {
      source: formatSource([
        `const completion: Fig.Subcommand = ${JSON.stringify(defaultSpec, null, 4)}\n`,
        `const versions: Fig.VersionDiffMap = {};\n`,
        `export { versions };`,
        `export default completion`,
      ]),
      spec: defaultSpec,
      versions: {},
    };
  }

  const imports = loadTypescriptModule(path);
  if (!imports.versions) {
    throw new Error("Path does not contains versioned spec");
  }
  return {
    source: fs.readFileSync(path).toString(),
    spec: imports.default,
    versions: imports.versions,
  };
};

async function addVersionToIndex(path: string, version: string) {
  const source = fs.readFileSync(path).toString();
  let didUpdate = false;
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.ES2015, true);
  const newSource = visitFileNodes(
    sourceFile,
    (node: ts.Node): ts.Node => {
      if (
        ts.isArrayLiteralExpression(node) &&
        ts.isVariableDeclaration(node.parent) &&
        ts.isIdentifier(node.parent.name) &&
        node.parent.name.escapedText === "versionFiles"
      ) {
        didUpdate = true;
        return ts.factory.updateArrayLiteralExpression(node, [
          ...node.elements,
          ts.factory.createStringLiteral(version),
        ]);
      }
      return node;
    }
  );

  if (!didUpdate) {
    throw new Error("Failed to add version to index");
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, newSource, sourceFile);
  fs.writeFileSync(path, formatSource(result));
}

const cleanPath = (path: string) => path.replace(/[^a-zA-Z0-9_\-/.]/, "");

async function addDiffAction(
  specNameRaw: string,
  newSpecPath: string,
  diffVersion: string,
  options: { newFile?: string; useMinorBase?: boolean }
) {
  const specName = cleanPath(specNameRaw);
  const version = semver.parse(diffVersion);
  let versionFileName: string;
  if (version === null) {
    versionFileName = diffVersion;
  } else {
    versionFileName = options.useMinorBase
      ? `${version.major}.${version.minor}.0`
      : `${version.major}.0.0`;
  }

  const currentSpecPath = `./${specName}/${versionFileName}.ts`;
  const newSpec = loadTypescriptModule(newSpecPath).default as Fig.Subcommand;
  const { source, spec, versions } = await loadVersionedSpec(currentSpecPath, newSpec);
  const versionNames = Object.keys(versions).sort(semver.compare);
  const lastVersion = versionNames[versionNames.length - 1];
  if (lastVersion && semver.compare(diffVersion, lastVersion) <= 0) {
    throw new Error(
      `Cannot publish version ${diffVersion}, later version ${lastVersion} already exists`
    );
  }
  const latestSpec = versionNames.map((name) => versions[name]).reduce(applySpecDiff, spec);
  const diff = diffSpecs(latestSpec, newSpec) ?? {};

  const versionExports = findInFile(
    ts.createSourceFile(currentSpecPath, source, ts.ScriptTarget.ES2015, true),
    (node: ts.Node) => {
      if (ts.isExportSpecifier(node) && node.name.escapedText === "versions") {
        return node.parent.parent;
      }
      return null;
    }
  );
  if (versionExports.length === 0) {
    throw new Error("No version export found");
  }
  const insertIdx = versionExports[versionExports.length - 1].getStart();
  if (!fs.existsSync(currentSpecPath)) {
    addVersionToIndex(`./${specName}/index.ts`, versionFileName);
  }
  fs.writeFileSync(
    options?.newFile ?? currentSpecPath,
    formatSource([
      source.slice(0, insertIdx),
      `\nversions["${diffVersion}"] = ${JSON.stringify(diff, null, 4)}\n`,
      source.slice(insertIdx),
    ])
  );
}

async function initVersionedSpec(path: string) {
  fs.mkdirSync(path, { recursive: true });
  const pathClean = cleanPath(path);
  fs.writeFileSync(
    `${pathClean}/index.ts`,
    formatSource(
      [
        `import { createVersionedSpec } from "@fig/autocomplete-helpers";\n`,
        `const versionFiles = [];\n`,
        `export default createVersionedSpec("${pathClean}", versionFiles);\n`,
      ].join("\n")
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function precomputeAction(files: string[]) {
  /*
  for (let file in files) {
    // For each spec file, check if it is versioned and if so precompute
    // spec files for each version.
  }
  */
  throw new Error("Unimplemented");
}

export default new Command("version")
  .addCommand(
    new Command("add-diff")
      .arguments("<specName> <newSpecFile> <diffVersion>")
      .description("generate version diff from  new spec and add into old spec")
      .option("-n, --new-file <path>", "Create a new spec instead of overwriting the old one")
      .option("--use-minor-base", "Create a new version file per minor version")
      .action(addDiffAction)
  )
  .addCommand(
    new Command("init-spec")
      .arguments("<path>")
      .description("generate versioned spec in folder specified by path")
      .action(initVersionedSpec)
  )
  .addCommand(
    new Command("precompute-specs")
      .arguments("<files...>")
      .description(
        "[Unimplemented] Precompute versioned specs before publishing the specs repo (unimplemented)"
      )
      .action(precomputeAction)
  );
