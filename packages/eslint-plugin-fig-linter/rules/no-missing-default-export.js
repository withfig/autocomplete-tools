module.exports = {
  meta: {
    type: "problem",
  },
  create(context) {
    let hasExport = false;

    return {
      ExportDefaultDeclaration(node) {
        hasExport = true;
      },
      'ExportSpecifier[exported.name="default"]': function (node) {
        hasExport = true;
      },
      "Program:exit": function (node) {
        if (!hasExport) {
          context.report({
            node,
            message: "File must default export a completion spec object",
          });
        }
      },
    };
  },
};
