import type { InterfaceDeclaration, TypeAliasDeclaration } from "typescript";
import type { TextRange, DocComment } from "@microsoft/tsdoc";
import ts from "typescript";

export type TypeDeclarationNode = InterfaceDeclaration | TypeAliasDeclaration;

export interface FoundNode<T extends TypeDeclarationNode = TypeDeclarationNode> {
  node: T;
  textRange?: TextRange;
  docComment?: DocComment;
}

export function isInterfaceDeclarationFoundNode(
  foundNode: FoundNode
): foundNode is FoundNode<InterfaceDeclaration> {
  return ts.isInterfaceDeclaration(foundNode.node);
}

export interface InterfaceDoc {
  name: string;
  filename?: string;
  members: MemberDoc[];
  extends: string[];
  inheritedMembers: MemberDoc[];
  hasDocComment: boolean;
}

export interface Parameter {
  name: string;
  description: string;
}

export interface TypeAliasDoc {
  name: string;
  summary?: string;
  parameters: Parameter[];
  returns?: string;
  declaration: string;
  discussion?: string;
  examples: string[];
}

export interface MemberDoc {
  name: string;
  excluded: boolean;
  summary?: string;
  optional: boolean;
  parameters: Parameter[];
  returns?: string;
  declaration: string;
  discussion?: string;
  examples: string[];
  default?: string;
  deprecated?: boolean | string;
  category?: string;
  hasDocComment: boolean;
}
