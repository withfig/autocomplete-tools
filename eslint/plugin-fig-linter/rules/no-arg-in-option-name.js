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
          optionNameNode.type === "ArrayExpression"
            ? optionNameNode.elements // name: ["--one", "--two"]
            : [optionNameNode]; // name: "--one"

        for (const node of optNameElementNodes) {
          if (node.type === "Literal" && typeof node.value === "string" && node.value.indexOf(" ") >= 0) {
            report(node);
          }
        }
      },
    };
  },
};
