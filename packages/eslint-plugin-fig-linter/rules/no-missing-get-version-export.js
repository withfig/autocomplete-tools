module.exports = {
  meta: {
    type: "problem",
  },
  create(context) {
    let hasExport = false;

    return {
      'ExportNamedDeclaration > FunctionDeclaration[id.name="getVersionCommand"]'() {
        hasExport = true;
      },
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="getVersionCommand"]'() {
        hasExport = true;
      },
      'ExportSpecifier[exported.name="getVersionCommand"]'() {
        hasExport = true;
      },
      "Program:exit": function (node) {
        if (!hasExport) {
          context.report({
            node,
            message: "File should have an exported function named `getVersionCommand`",
          });
        }
      },
    };
  },
};
