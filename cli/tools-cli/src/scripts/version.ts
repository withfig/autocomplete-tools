import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import semver from "semver";
import { applySpecDiff, diffSpecs } from "@fig/autocomplete-helpers";
import { importFromStringSync } from "module-from-string";
import prettier from "prettier";
import ts from "typescript";
import { build } from "esbuild";

export const copyDirectorySync = (oldPath: string, newPath: string) => {
  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath, { recursive: true });
  }

  for (const dirent of fs.readdirSync(oldPath, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      copyDirectorySync(path.resolve(oldPath, dirent.name), path.resolve(newPath, dirent.name));
    } else if (dirent.isFile()) {
      fs.writeFileSync(
        path.resolve(newPath, dirent.name),
        fs.readFileSync(path.resolve(oldPath, dirent.name)),
        { encoding: "utf8" }
      );
    }
  }
};

const visitFileNodes = (source: ts.SourceFile, visitor: ts.Visitor): ts.Node =>
  ts.transform(source, [
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      const visit = (node: ts.Node): ts.VisitResult<ts.Node> =>
        visitor(ts.visitEachChild(node, visit, context)) as ts.VisitResult<ts.Node>;
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
  });

const loadTypescriptModule = async (modulePath: string) => {
  const jsString = (
    await build({
      entryPoints: [modulePath],
      bundle: true,
      write: false,
      sourcemap: false,
      loader: { ".ts": "ts" },
      keepNames: true,
      target: "esnext",
      minify: false,
      format: "esm",
    })
  ).outputFiles[0].text;
  return importFromStringSync(jsString, {
    dirname: process.cwd(),
  });
};

const loadVersionedSpec = async (
  specPath: string,
  defaultSpec: Fig.Subcommand
): Promise<{
  source: string;
  spec: Fig.Subcommand;
  versions: Fig.VersionDiffMap;
}> => {
  if (!fs.existsSync(specPath)) {
    // TODO: change the way the spec is printed, currently it won't support js variables
    return {
      source: await formatSource([
        `const completion: Fig.Subcommand = ${JSON.stringify(defaultSpec, null, 4)}\n`,
        `const versions: Fig.VersionDiffMap = {};\n`,
        `export { versions };`,
        `export default completion`,
      ]),
      spec: defaultSpec,
      versions: {},
    };
  }

  const imports = await loadTypescriptModule(specPath);
  if (!imports.versions) {
    throw new Error("Path does not contain versioned spec");
  }
  return {
    source: fs.readFileSync(specPath).toString(),
    spec: imports.default,
    versions: imports.versions,
  };
};

async function addVersionToIndex(sourcePath: string, version: string) {
  const source = fs.readFileSync(sourcePath).toString();
  let didUpdate = false;
  const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.ES2015, true);
  const newSource = visitFileNodes(sourceFile, (node: ts.Node): ts.Node => {
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
  });

  if (!didUpdate) {
    throw new Error("Failed to add version to index");
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, newSource, sourceFile);
  fs.writeFileSync(sourcePath, await formatSource(result));
}

const cleanPath = (p: string) => p.replace(/[^a-zA-Z0-9_\-/.]/, "");

async function initVersionedSpec(specName: string, options: { cwd?: string }) {
  const cleanedSpecName = cleanPath(specName);
  const rootSpecPath = path.resolve(options.cwd ?? process.cwd(), specName);
  fs.mkdirSync(rootSpecPath, { recursive: true });
  fs.writeFileSync(
    `${rootSpecPath}/index.ts`,
    await formatSource(
      [
        `import { createVersionedSpec } from "@fig/autocomplete-helpers";\n`,
        `const versionFiles = [];\n`,
        `export default createVersionedSpec("${cleanedSpecName}", versionFiles);\n`,
      ].join("\n")
    )
  );
}

async function addDiffAction(
  specName: string,
  newSpecPath: string,
  diffVersion: string,
  options: { newPath?: string; useMinorBase?: boolean; cwd?: string }
) {
  let folderSpecPath = path.resolve(options.cwd ?? process.cwd(), specName);
  if (options.newPath) {
    const newPath = path.resolve(options.newPath, specName);
    if (fs.existsSync(folderSpecPath)) {
      // check that the new path is not a child of the old
      const relative = path.relative(folderSpecPath, newPath);
      const isSubdirectory = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
      if (isSubdirectory)
        throw new Error("'--new-path' must not be a sub-directory of the old spec directory");
      copyDirectorySync(folderSpecPath, newPath);
    } else {
      await initVersionedSpec(specName, { cwd: options.newPath });
    }
    folderSpecPath = newPath;
  } else if (!fs.existsSync(folderSpecPath)) {
    await initVersionedSpec(specName, { cwd: options.cwd });
  }

  const version = semver.parse(diffVersion);
  let versionFileName: string;
  if (version === null) {
    versionFileName = diffVersion;
  } else {
    versionFileName = options.useMinorBase
      ? `${version.major}.${version.minor}.0`
      : `${version.major}.0.0`;
  }

  const currentSpecPath = path.resolve(folderSpecPath, `${versionFileName}.ts`);
  const newSpec = (await loadTypescriptModule(newSpecPath)).default as Fig.Subcommand;
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
      if (ts.isExportSpecifier(node) && node.name.getText() === "versions") {
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
    addVersionToIndex(path.resolve(folderSpecPath, "index.ts"), versionFileName);
  }
  fs.writeFileSync(
    currentSpecPath,
    await formatSource([
      source.slice(0, insertIdx),
      `\nversions["${diffVersion}"] = ${JSON.stringify(diff, null, 4)}\n`,
      source.slice(insertIdx),
    ])
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
      .arguments("<specName> <newSpecFilePath> <diffVersion>")
      .description("generate version diff from new spec and add into old spec")
      .option(
        "-n, --new-path <path>",
        "The root folder where the updated spec will be saved. Note: this must NOT include the folder spec name"
      )
      .option("--cwd <path>", "Resolve the spec name relative to this directory")
      .option("--use-minor-base", "Create a new version file per minor version")
      .action(addDiffAction)
  )
  .addCommand(
    new Command("init-spec")
      .arguments("<name>")
      .option("--cwd <path>", "Generate the spec relative to this directory")
      .description("Generate versioned spec in folder specified by path")
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
