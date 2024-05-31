/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Project,
  ts,
  SourceFile,
  Node,
  Symbol as TSMSymbol,
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Expression,
  ObjectLiteralElementLike,
  ExportAssignment,
} from "ts-morph";
import * as prettier from "prettier";
import { defaultPreset, presets } from "./presets";
import type { PresetName, Preset } from "./presets";
import { Errors } from "./errors";

const project = new Project();

function parseFile(filePath: string, input: string): SourceFile {
  return project.createSourceFile(filePath, input, { overwrite: true });
}

function setupFile(
  path: string,
  file: string,
  getDefaultExport?: true
): [sourceFile: SourceFile, defaultExport: TSMSymbol];
function setupFile(path: string, file: string, getDefaultExport: false): [sourceFile: SourceFile];
function setupFile(path: string, file: string, getDefaultExport = true) {
  const sourceFile = parseFile(path, file);
  if (getDefaultExport) {
    const sourceFileDefaultExport = sourceFile.getDefaultExportSymbol();
    if (!sourceFileDefaultExport) throw Errors.MissingDefaultExport(path);
    return [sourceFile, sourceFileDefaultExport];
  }
  return [sourceFile];
}

function isSpecObject(statement: Node<ts.Statement>, name: string): boolean {
  if (Node.isVariableStatement(statement)) {
    const declarations = statement.getDeclarationList().getDeclarations();
    return declarations.some((declaration) => declaration.getName() === name);
  }
  return false;
}

/**
 * @returns {ts.Node[]} the node path of the specified node, it should be read from the end to the start
 */
// TODO: find a way to avoid recalculating this every time. It may be expensive for complex specs
function generateNodePath(node: ts.PropertyAssignment | ts.ShorthandPropertyAssignment): ts.Node[] {
  let currentNode: ts.Node = node;
  const path: ts.Node[] = [];
  do {
    path.push(currentNode);
    currentNode = currentNode.parent;
  } while (!ts.isVariableDeclaration(currentNode));
  return path;
}

function compareObjectLiteralElementLike(
  nodeA: ts.ObjectLiteralElementLike,
  nodeB: ObjectLiteralElementLike
): boolean {
  if (nodeA.kind !== nodeB.getKind()) return false;
  if (Node.isPropertyAssignment(nodeB)) {
    return expressionsAreEqual(
      (nodeA as ts.PropertyAssignment).initializer,
      nodeB.getInitializer()
    );
  }
  // true for ShorthandPropertyAssignment, SpreadAssignment
  return true;
}

/**
 * Checks if A is a literal contained in B (ArrayLiteral)
 * @param expressionA
 * @param expressionB
 */
function expressionAIsSubsetOfB(expressionA?: ts.Expression, expressionB?: ts.Expression): boolean {
  if (!expressionA || !expressionB) return false;
  if (
    expressionB.kind === ts.SyntaxKind.ArrayLiteralExpression &&
    (expressionA.kind === ts.SyntaxKind.StringLiteral ||
      expressionA.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
      expressionA.kind === ts.SyntaxKind.NumericLiteral)
  ) {
    const expressionAText = expressionA.getText();
    return (expressionB as ts.ArrayLiteralExpression).elements.some(
      (node) => node.getText() === expressionAText
    );
  }
  return false;
}

function expressionsAreEqual(
  expressionA?: ts.Expression,
  expressionB?: Expression<ts.Expression>
): boolean {
  if (!expressionA || !expressionB) return false;
  if (expressionA.kind !== expressionB.getKind()) return false;
  if (Node.isArrayLiteralExpression(expressionB)) {
    const elementsA = (expressionA as ts.ArrayLiteralExpression).elements;
    const elementsB = expressionB.getElements();
    return (
      elementsA.length === elementsB.length &&
      elementsA.every((element, index) => expressionsAreEqual(element, elementsB[index]))
    );
  }
  if (
    Node.isStringLiteral(expressionB) ||
    Node.isNoSubstitutionTemplateLiteral(expressionB) ||
    Node.isNumericLiteral(expressionB)
  ) {
    // @ts-expect-error
    return expressionB.getLiteralText() === expressionA.text;
  }
  if (Node.isObjectLiteralExpression(expressionB)) {
    const propertiesA = (expressionA as ts.ObjectLiteralExpression).properties;
    const propertiesB = expressionB.getProperties();
    return (
      propertiesA.length === propertiesB.length &&
      propertiesA.every((property, index) => {
        const propertyText = property.name?.getText();
        // if the properties at the same index has the same name we avoid an useless search
        if (propertyText === propertiesB[index].compilerNode.name?.getText()) {
          return compareObjectLiteralElementLike(property, propertiesB[index]);
        }
        // otherwise we need to search an eventual property with the same name
        const foundProperty = propertiesB.find(
          (prop) => propertyText === prop.compilerNode.name?.getText()
        );
        if (!foundProperty) return false;
        return compareObjectLiteralElementLike(property, foundProperty);
      })
    );
  }
  // fallback for all other nodes that should just have the same kind e.g. FalseNode and TrueNode
  return true;
}

function resolveArrayLiteral(path: ts.Node[], arrayNode: ArrayLiteralExpression): Node | undefined {
  const newPath = path.slice(0, -1);
  const currentPathItem = newPath[newPath.length - 1];
  const elements = arrayNode.getElements();

  // The assertion below is an identity, we just use it for type casting
  if (ts.isObjectLiteralExpression(currentPathItem)) {
    // Check if the object has a name property and get its value
    const nameToFind = currentPathItem.properties.filter(
      (prop): prop is ts.PropertyAssignment =>
        ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === "name"
    )[0]?.initializer;

    if (nameToFind) {
      for (const element of elements) {
        if (Node.isObjectLiteralExpression(element)) {
          const nameProp = element.getProperty("name");
          if (nameProp && Node.isPropertyAssignment(nameProp)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const initializer = nameProp.getInitializer()!; // getInitializer on PropertyAssignment never returns undefined
            if (
              expressionsAreEqual(nameToFind, initializer) ||
              // if nameToFind is StringLiteral and initializer is ArrayLiteralExpression
              // e.g. '--name' and ['--name', '-n']
              expressionAIsSubsetOfB(nameToFind, initializer.compilerNode) ||
              expressionAIsSubsetOfB(initializer.compilerNode, nameToFind)
            ) {
              return resolve(newPath, element);
            }
          }
        }
      }
    } else {
      // check which is the index of currentPathItem in the parent ArrayExpression
      const foundIndex = (currentPathItem.parent as ts.ArrayLiteralExpression).elements.findIndex(
        (arrayElement) => arrayElement === currentPathItem
      );
      const element = elements[foundIndex];
      if (element && Node.isObjectLiteralExpression(element)) {
        return resolve(newPath, element);
      }
    }
  }
  return undefined;
}

function resolveObjectLiteral(
  path: ts.Node[],
  objectNode: ObjectLiteralExpression
): Node | undefined {
  const newPath = path.slice(0, -1);
  const currentPathItem = newPath[newPath.length - 1];
  // expect child item of an ObjectLiteral to be a PropertyAssignment
  if (!(ts.isPropertyAssignment(currentPathItem) && ts.isIdentifier(currentPathItem.name))) {
    return undefined;
  }
  const propNameToFind = currentPathItem.name.text;
  const props = objectNode.getProperties();
  for (const prop of props) {
    if (Node.isPropertyAssignment(prop) && prop.getName() === propNameToFind) {
      // if there is a matching prop and this is the last one item of the path return the prop.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return resolve(newPath.slice(0, -1), prop.getInitializer()!); // getInitializer on PropertyAssignment never returns undefined
    }
  }
  if (newPath.length === 1) {
    // if the last property of the path is only in the old spec (still needs to be added to the new one)
    return objectNode;
  }
  return undefined;
}

// The first item of a path is always a PropertyAssignment (the first is effectively the last item, the one we are looking for)
function resolve(path: ts.Node[], baseNode: Node): Node | undefined {
  if (!path.length) return baseNode;

  const currentItem = path[path.length - 1];
  if (ts.isObjectLiteralExpression(currentItem) && Node.isObjectLiteralExpression(baseNode)) {
    return resolveObjectLiteral(path, baseNode);
  }
  if (ts.isArrayLiteralExpression(currentItem) && Node.isArrayLiteralExpression(baseNode)) {
    return resolveArrayLiteral(path, baseNode);
  }
  return undefined;
}

function resolveAndUpdateNodePath(
  path: ts.Node[],
  newSpec: SourceFile,
  nodeToAdd: { name: string; initializer: string },
  newFileName: string
): boolean {
  // TODO: we currently assume we have just one declaration in the new file since it should be autogenerated by some kind of tool
  const statement = newSpec.getFirstDescendantByKind(ts.SyntaxKind.VariableDeclaration);
  if (!statement) throw Errors.MissingSpecVariableDeclaration(newFileName);

  const statementInitializer = statement.getInitializer();
  if (statementInitializer && Node.isObjectLiteralExpression(statementInitializer)) {
    const out = resolve(path, statementInitializer);
    if (out && Node.isObjectLiteralExpression(out)) {
      out.addPropertyAssignment(nodeToAdd);
      return true;
    }
    // if Node.isPropertyAssignement(out) -> the property already exist at the specified path. We keep the updated one.
    return false;
  }
  throw Errors.MissingSpecVariableDeclaration(newFileName);
}

function getFirstParentProperty(nodePath: ts.Node[]): ts.PropertyAssignment | undefined {
  let i = 1; // exclude the first element as we know it is a property (the leaf property)
  while (i <= nodePath.length - 1) {
    const node = nodePath[i];
    if (ts.isPropertyAssignment(node)) {
      return node;
    }
    i += 1;
  }
  return undefined;
}

function getObservedSet(
  updatable: Preset,
  parentProperty?: ts.PropertyAssignment
): Set<string> | undefined {
  if (!parentProperty) return updatable.commandProps; // we are handling a top-level command
  if (ts.isIdentifier(parentProperty.name)) {
    const parentPropText = parentProperty.name.text;
    // eslint-disable-next-line no-nested-ternary
    return parentPropText === "subcommands"
      ? updatable.commandProps
      : parentPropText === "options"
        ? updatable.optionProps
        : updatable.argProps; // parentPropText === "args"
  }
  return undefined;
}

// `statement` can only be one of the top-level statements
function traverseSpecs(
  statement: Node<ts.Statement>,
  destination: SourceFile,
  updatableProps: Preset,
  newFileName: string
) {
  statement.transform((traversal) => {
    const node = traversal.visitChildren();
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
      const nodePath = generateNodePath(node);
      const parentProperty = getFirstParentProperty(nodePath);
      const observedSet = getObservedSet(updatableProps, parentProperty);
      if (observedSet && !observedSet.has(node.name.text)) {
        resolveAndUpdateNodePath(
          nodePath,
          destination,
          {
            name: node.name.text,
            initializer: node.initializer.getText(),
          },
          newFileName
        );
      }
    }
    return node;
  });
}

export interface MergeOptions {
  ignore?: {
    commandProps?: string[];
    optionProps?: string[];
    argProps?: string[];
    commonProps?: string[];
  };
  preset?: PresetName;
  prettifyOutput?: boolean;
  oldFileName?: string;
  newFileName?: string;
}

function getPreset({ preset, ignore = {} }: MergeOptions): Preset {
  // Props updated by the eventual CLI tool integration (preset)
  let updatableProps = preset ? presets[preset] : undefined;
  // If no preset was specified we default to the defaultPreset adding all props the user ignored
  if (!updatableProps) {
    updatableProps = defaultPreset();
    const { commandProps = [], optionProps = [], argProps = [], commonProps = [] } = ignore;
    for (const commandProp of commandProps) {
      updatableProps.commandProps.add(commandProp);
    }
    for (const optionProp of optionProps) {
      updatableProps.optionProps.add(optionProp);
    }
    for (const argProp of argProps) {
      updatableProps.argProps.add(argProp);
    }
    for (const commonProp of commonProps) {
      updatableProps.commandProps.add(commonProp);
      updatableProps.optionProps.add(commonProp);
      updatableProps.argProps.add(commonProp);
    }
  }
  return updatableProps;
}

export async function merge(
  oldFileContent: string,
  newFileContent: string,
  options: MergeOptions
): Promise<string> {
  const oldFileName = options.oldFileName ?? "oldfile.ts";
  const newFileName = options.newFileName ?? "newfile.ts";

  const updatableProps = getPreset(options);

  const [oldSourceFile, oldSourceFileDefaultExport] = setupFile(oldFileName, oldFileContent);
  const [newSourceFile] = setupFile(newFileName, newFileContent, false);
  /// MARK: Work on old source file by extracting top level statements
  let specNodeName: string;
  // It should contain exactly one declaration since it is a default export
  const exportDeclaration = oldSourceFileDefaultExport.getDeclarations()[0] as ExportAssignment;
  const exportDeclarationExpression = exportDeclaration.getExpression();
  if (Node.isIdentifier(exportDeclarationExpression)) {
    specNodeName = exportDeclarationExpression.getText();
  } else if (Node.isObjectLiteralExpression(exportDeclarationExpression)) {
    throw Errors.NoDirectDefaultExport(oldFileName);
  } else {
    throw Errors.DefaultExportShouldBeAnIdentifier(oldFileName);
  }

  const diffTopLevelNodes: [start: string, middle: string, end: string] = ["", "", ""];
  const statements = oldSourceFile.getStatements();
  let state = 0;
  for (const statement of statements) {
    if (isSpecObject(statement, specNodeName)) {
      traverseSpecs(statement, newSourceFile, updatableProps, newFileName);
      state += 1;
    } else if (statement === exportDeclaration) {
      state += 1;
    } else {
      diffTopLevelNodes[state] += statement.print();
    }
  }

  /// MARK: Save top level statements of the old file to the new source file
  newSourceFile.insertStatements(2, diffTopLevelNodes[2]);
  newSourceFile.insertStatements(1, diffTopLevelNodes[1]);
  newSourceFile.insertStatements(0, diffTopLevelNodes[0]);

  const outputFile = ts.createPrinter().printFile(newSourceFile.compilerNode);
  if (options.prettifyOutput ?? true) {
    return prettier.format(outputFile, { parser: "typescript" });
  }
  return outputFile;
}
