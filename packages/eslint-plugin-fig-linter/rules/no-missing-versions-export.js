module.exports = {
  meta: {
    type: "problem",
  },
  create(context) {
    let hasExport = false;

    return {
      'ExportNamedDeclaration > FunctionDeclaration[id.name="versions"]'() {
        hasExport = true;
      },
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="versions"]'() {
        hasExport = true;
      },
      'ExportSpecifier[exported.name="versions"]'() {
        hasExport = true;
      },
      "Program:exit": function (node) {
        if (!hasExport) {
          context.report({
            node,
            message: "File should have an exported object named `versions`",
          });
        }
      },
    };
  },
};
