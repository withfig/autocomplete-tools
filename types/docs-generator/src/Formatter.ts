import { DocNode, DocExcerpt } from "@microsoft/tsdoc";

export class Formatter {
  public static renderDocNode(docNode: DocNode | undefined): string {
    let result = "";
    if (docNode) {
      if (docNode instanceof DocExcerpt) {
        result += docNode.content.toString();
      }
      for (const childNode of docNode.getChildNodes()) {
        result += Formatter.renderDocNode(childNode);
      }
    }
    return result;
  }

  public static renderDocNodes(docNodes: ReadonlyArray<DocNode>): string {
    let result = "";
    for (const docNode of docNodes) {
      result += Formatter.renderDocNode(docNode);
    }
    return result;
  }

  private static matchInitialWhitespaces(str: string) {
    return str.match(/^\s+/g)?.[0].length ?? 0;
  }

  private static INDENTATION_WHITESPACES = 2;

  public static indentDeclaration(declaration: string): string {
    const lines = declaration.trim().split("\n");
    if (lines.length > 1) {
      let indentChars = 0;
      // this is set to the indentation of the first line which does not have whitespaces at the beginning
      let previousIndentedChars =
        this.matchInitialWhitespaces(lines[1]) - this.INDENTATION_WHITESPACES;

      const indentedLines: string[] = [lines[0]];
      for (let i = 1; i < lines.length; i += 1) {
        const line = lines[i];
        const currentIndentedChars = this.matchInitialWhitespaces(line);
        const indentCharDiff = currentIndentedChars - previousIndentedChars;
        if (indentCharDiff !== 0) {
          indentChars += indentCharDiff;
        }
        previousIndentedChars = currentIndentedChars;
        indentedLines.push(`${" ".repeat(indentChars)}${line.trim()}`);
      }

      return indentedLines.join("\n");
    }
    return lines[0];
  }
}
