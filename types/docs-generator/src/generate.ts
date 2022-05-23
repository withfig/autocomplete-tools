import ts, { TypeAliasDeclaration } from "typescript";
import * as tsdoc from "@microsoft/tsdoc";
import { DocManager, tagDefinitions } from "./DocManager";
import {
  FoundNode,
  InterfaceDoc,
  isInterfaceDeclarationFoundNode,
  MemberDoc,
  TypeAliasDoc,
} from "./types";
import { Formatter } from "./Formatter";

function walkCompilerAstAndFindComments(node: ts.Node, foundNodes: FoundNode[]): void {
  const sourceText = node.getSourceFile().getFullText(); // don't use getText() here!
  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
    const foundNode: FoundNode = {
      node,
    };
    // Find "/** */" style comments associated with this node.
    // Note that this reinvokes the compiler's scanner -- the result is not cached.
    // We may always assume that a node has just one jsdoc comment
    const comments = DocManager.getJSDocCommentRanges(node, sourceText);

    const docComment = DocManager.parseFirstDocComment(comments, sourceText);
    if (docComment) {
      const comment = comments[0];
      foundNode.docComment = docComment;
      foundNode.textRange = tsdoc.TextRange.fromStringRange(sourceText, comment.pos, comment.end);
    }
    foundNodes.push(foundNode);
  }

  return node.forEachChild((child) => walkCompilerAstAndFindComments(child, foundNodes));
}

function generateParamsFromBlock(blocks: readonly tsdoc.DocParamBlock[] = []) {
  return blocks.map((block) => ({
    name: block.parameterName,
    description: Formatter.renderDocNode(block.content).trim(),
  }));
}

function generateMember(memberNode: ts.TypeElement, sourceText: string): MemberDoc {
  const docComment = DocManager.parseFirstDocComment(memberNode, sourceText);
  const examples: string[] = [];
  let defaultValue;
  let category;
  for (const block of docComment?.customBlocks ?? []) {
    switch (block.blockTag.tagName) {
      case "@example":
        examples.push(Formatter.renderDocNode(block.content).trim());
        break;
      case "@defaultValue":
        defaultValue = Formatter.renderDocNode(block.content).trim();
        break;
      case "@category":
        category = Formatter.renderDocNode(block.content).trim();
        break;
      default:
    }
  }
  return {
    // memberNode may be an IndexSignature or another type which doesn't have a name
    name: memberNode.name!.getText(),
    excluded: docComment?.modifierTagSet.hasTag(tagDefinitions.excludedTag) ?? false,
    ...(docComment?.summarySection && {
      summary: Formatter.renderDocNode(docComment.summarySection).trim(),
    }),
    ...(docComment?.returnsBlock && {
      returns: Formatter.renderDocNode(docComment.returnsBlock?.content).trim(),
    }),
    ...(docComment?.remarksBlock && {
      discussion: Formatter.renderDocNode(docComment.remarksBlock?.content).trim(),
    }),
    parameters: generateParamsFromBlock(docComment?.params.blocks),
    ...(docComment?.deprecatedBlock && {
      deprecated:
        Formatter.renderDocNode(docComment.deprecatedBlock.content).trim() ||
        "This property has been deprecated.",
    }),
    optional: !!memberNode.questionToken,
    declaration: memberNode.getText(),
    examples,
    category,
    default: defaultValue,
    hasDocComment: !!docComment,
  };
}

function generateInterface(_interface: FoundNode<ts.InterfaceDeclaration>): InterfaceDoc {
  const { node: interfaceNode, docComment } = _interface;
  const sourceText = interfaceNode.getSourceFile().getFullText();

  let filename;
  const filenameBlock = docComment?.customBlocks.filter(
    (block) => block.blockTag.tagName === "@filename"
  )[0];
  if (filenameBlock) {
    filename = Formatter.renderDocNode(filenameBlock.content).trim();
  }

  let heritageClauses: string[] = [];
  if (interfaceNode.heritageClauses) {
    heritageClauses = interfaceNode.heritageClauses.flatMap((clause) =>
      clause.types.map((type) => type.getText())
    );
  }

  return {
    name: interfaceNode.name.getText(),
    filename,
    hasDocComment: !!docComment,
    extends: heritageClauses,
    members: interfaceNode.members.map((member) => generateMember(member, sourceText)),
    inheritedMembers: [],
  };
}

function generateTypeAlias(_typeAlias: FoundNode<ts.TypeAliasDeclaration>): TypeAliasDoc {
  const { node: typeAliasNode, docComment } = _typeAlias;
  return {
    name: typeAliasNode.name.getText(),
    declaration: typeAliasNode.getText(),
    ...(docComment?.summarySection && {
      summary: Formatter.renderDocNode(docComment.summarySection).trim(),
    }),
    ...(docComment?.returnsBlock && {
      returns: Formatter.renderDocNode(docComment.returnsBlock?.content).trim(),
    }),
    ...(docComment?.remarksBlock && {
      discussion: Formatter.renderDocNode(docComment.remarksBlock?.content).trim(),
    }),
    examples: (docComment?.customBlocks ?? [])
      .filter((block) => block.blockTag.tagName === "@example")
      .map((block) => Formatter.renderDocNode(block.content).trim()),
    parameters: generateParamsFromBlock(docComment?.params.blocks),
  };
}

export function generate(sourceText: string) {
  const interfaces = [];
  const typeAliases = [];

  const sourceFile = ts.createSourceFile(
    "docs.ts",
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  if (!sourceFile) {
    throw new Error("Could not get source file.");
  }

  const foundNodes: FoundNode[] = [];

  walkCompilerAstAndFindComments(sourceFile, foundNodes);
  for (const foundNode of foundNodes) {
    if (isInterfaceDeclarationFoundNode(foundNode)) {
      interfaces.push(generateInterface(foundNode));
    } else {
      typeAliases.push(generateTypeAlias(foundNode as FoundNode<TypeAliasDeclaration>));
    }
  }

  const mappedInterfaces = new Map(interfaces.map((_interface) => [_interface.name, _interface]));
  // add inheritedMembers to interface
  // eslint-disable-next-line no-underscore-dangle
  for (let i = 0; i < interfaces.length; i += 1) {
    if (interfaces[i].extends.length) {
      // assume interfaces only extend interfaces
      for (const extend of interfaces[i].extends) {
        interfaces[i].inheritedMembers.push(...(mappedInterfaces.get(extend)?.members ?? []));
      }
    }
  }

  return {
    interfaces,
    typeAliases,
  };
}
