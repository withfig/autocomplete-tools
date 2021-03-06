module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
  },
  create(context) {
    return {
      Property(node) {
        if (node.key.name === "name") {
          const currentNode = node.value;
          if (
            currentNode.type === "Literal" &&
            currentNode.value.endsWith("=")
          ) {
            context.report({
              node,
              message: "The name property must not include `=`",
              fix(fixer) {
                const [, end] = currentNode.range;
                return fixer.replaceTextRange([end - 2, end - 1], "");
              },
            });
          }
        }
      },
    };
  },
};
