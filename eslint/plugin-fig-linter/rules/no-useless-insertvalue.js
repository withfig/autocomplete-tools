module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
  },
  create(context) {
    return {
      'ObjectExpression > Property[key.name="insertValue"]': function (node) {
        const nameProp = node.parent.properties.find(
          (prop) => prop?.key?.name === "name"
        );

        if (!nameProp) return;

        const insertValue = node.value.value;
        const nameValue = nameProp.value.value;

        if (!insertValue || !nameValue) return;
        if (insertValue.trim() === nameValue.trim()) {
          context.report({
            node,
            message:
              "The insertValue prop can be omitted if the value is the same as name",
            fix(fixer) {
              const [start, end] = node.range;
              // TODO: check if there is a comma after the prop before removing end + 1
              return fixer.removeRange([start, end + 1]);
            },
          });
        }
      },
    };
  },
};
