import ts from "typescript";
import * as tsdoc from "@microsoft/tsdoc";
import { DocManager, tagDefinitions } from "./DocManager";

function getFirstParentPropertySignatureOrTypeAliasDeclaration(
  node: ts.Node
): ts.PropertySignature | ts.TypeAliasDeclaration | undefined {
  let n = node;
  do {
    if (ts.isPropertySignature(n) || ts.isTypeAliasDeclaration(n)) {
      return n;
    }
    n = n.parent;
  } while (n);
  return undefined;
}

export function analyze(path: string): string {
  const program = ts.createProgram([path], { target: ts.ScriptTarget.ESNext });
  const sourceFile = program.getSourceFile(path);
  const checker = program.getTypeChecker();

  if (!sourceFile) {
    throw new Error("Error retrieving source file");
  }

  const typeArgumentsReplacer = (
    rootTypeAlias: ts.TypeAliasDeclaration,
    typeArguments: ts.NodeArray<ts.TypeNode>
  ) => {
    const typeParamsMap = new Map<ts.__String, ts.TypeNode>();
    for (const [index, param] of Array.from((rootTypeAlias.typeParameters ?? []).entries())) {
      typeParamsMap.set(
        param.name.escapedText,
        typeArguments[index] ? typeArguments[index] : param.default!
      );
    }
    return (ctx: ts.TransformationContext) => (typeNode: ts.TypeNode): ts.TypeNode => {
      const visit = (node: ts.Node): ts.Node => {
        if (
          ts.isTypeReferenceNode(node) &&
          ts.isIdentifier(node.typeName) &&
          typeParamsMap.get(node.typeName.escapedText)
        ) {
          return typeParamsMap.get(node.typeName.escapedText)!;
        }
        return ts.visitEachChild(node, visit, ctx);
      };

      return ts.visitNode(typeNode, visit);
    };
  };

  const typeReferenceTransformer = (ctx: ts.TransformationContext) => (
    sourceNode: ts.SourceFile
  ) => {
    const sourceText = sourceNode.getFullText();
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isTypeReferenceNode(node)) {
        // early return if the current node parent has an irreplaced tag or if the current node is the same as on of the parents
        const parent = getFirstParentPropertySignatureOrTypeAliasDeclaration(node);
        let docComment: tsdoc.DocComment | undefined;
        if (parent) {
          docComment = DocManager.parseFirstDocComment(parent, sourceText);
          if (docComment && docComment.modifierTagSet.hasTag(tagDefinitions.irreplacedTag)) {
            return ts.visitEachChild(node, visit, ctx);
          }
        }

        const type = checker.getTypeAtLocation(node.typeName);
        const declaration = type.aliasSymbol?.declarations?.[0];
        if (
          declaration &&
          ts.isTypeAliasDeclaration(declaration) &&
          // @ts-expect-error: parent is not property of ts.Symbol
          type.aliasSymbol.parent?.escapedName === "Fig"
        ) {
          const declarationDocComment = DocManager.parseFirstDocComment(declaration, sourceText);
          if (
            !declarationDocComment ||
            !declarationDocComment.modifierTagSet.hasTag(tagDefinitions.irreplaceableTag)
          ) {
            let newType = declaration.type;
            if (node.typeArguments && node.typeArguments.length > 0) {
              const { transformed } = ts.transform(declaration.type, [
                typeArgumentsReplacer(declaration, node.typeArguments),
              ]);
              [newType] = transformed;
            }

            // if the @replaceFirstLevel is specified we just return the first level type reference
            if (
              docComment &&
              docComment.modifierTagSet.hasTag(tagDefinitions.replaceFirstLevelTag)
            ) {
              return newType;
            }
            // we revisit the node since some replaced TypeReferences may be TypeReferences
            return ts.visitNode(newType, visit);
          }
        }
      }
      return ts.visitEachChild(node, visit, ctx);
    };

    return ts.visitNode(sourceNode, visit);
  };

  const { transformed } = ts.transform<ts.SourceFile>(sourceFile, [typeReferenceTransformer]);
  const printer = ts.createPrinter();
  return printer.printFile(transformed[0]);
}
