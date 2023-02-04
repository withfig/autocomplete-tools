module.exports = {
  meta: {
    type: "problem",
  },
  create(context) {
    function report (node) {
      context.report({
        node: node,
        message:
          "Args should be separated from the option name, see https://fig.io/docs/reference/option#args",
      });
    }
    return {
      'ObjectExpression > Property[key.name="options"] > ArrayExpression > ObjectExpression > Property[key.name="name"]': function (node) {
        const optionNameNode = node.value;
        const optNameElementNodes =
          optionNameNode.kind === "ArrayExpression"
            ? optionNameNode.elements // name: ["--one", "--two"]
            : [optionNameNode]; // name: "--one"

        for (const node of optNameElementNodes) {
          if (node.kind === "Literal" && typeof node.value === "string") {
            report(node);
          }
        }
      },
    };
  },
};
