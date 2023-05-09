import ts from "typescript";
import * as tsdoc from "@microsoft/tsdoc";

export const tagDefinitions = {
  filenameTag: new tsdoc.TSDocTagDefinition({
    tagName: "@filename",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  }),
  excludedTag: new tsdoc.TSDocTagDefinition({
    tagName: "@excluded",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  }),
  irreplacedTag: new tsdoc.TSDocTagDefinition({
    tagName: "@irreplaced",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  }),
  irreplaceableTag: new tsdoc.TSDocTagDefinition({
    tagName: "@irreplaceable",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  }),
  replaceFirstLevelTag: new tsdoc.TSDocTagDefinition({
    tagName: "@replaceFirstLevel",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  }),
  categoryTag: new tsdoc.TSDocTagDefinition({
    tagName: "@category",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag,
  }),
  ignoreTag: new tsdoc.TSDocTagDefinition({
    tagName: "@ignore",
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  }),
};

const configuration = new tsdoc.TSDocConfiguration();
configuration.addTagDefinitions(Object.values(tagDefinitions));

export class DocManager {
  static parser = new tsdoc.TSDocParser(configuration);

  static getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
    const commentRanges: ts.CommentRange[] = [];
    commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

    // True if the comment starts with '/**' but not if it is '/**/'
    return commentRanges.filter(
      (comment) =>
        text.charCodeAt(comment.pos + 1) === 0x2a /* ts.CharacterCodes.asterisk */ &&
        text.charCodeAt(comment.pos + 2) === 0x2a /* ts.CharacterCodes.asterisk */ &&
        text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
    );
  }

  static parseFirstDocComment(node: ts.Node, sourceText: string): tsdoc.DocComment | undefined;

  static parseFirstDocComment(
    comments: ts.CommentRange[],
    sourceText: string
  ): tsdoc.DocComment | undefined;

  static parseFirstDocComment(nodeOrComments: ts.CommentRange[] | ts.Node, sourceText: string) {
    const comments = Array.isArray(nodeOrComments)
      ? nodeOrComments
      : this.getJSDocCommentRanges(nodeOrComments, sourceText);
    if (comments.length > 0) {
      const comment = comments[0];
      const { docComment } = this.parser.parseRange(
        tsdoc.TextRange.fromStringRange(sourceText, comment.pos, comment.end)
      );
      return docComment;
    }
    return undefined;
  }
}
