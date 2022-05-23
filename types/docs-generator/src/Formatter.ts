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
}
