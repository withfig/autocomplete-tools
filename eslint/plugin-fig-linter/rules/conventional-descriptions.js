const PROBLEMS = {
  trailingDot: "no trailing dot",
  leadingWhitespaces: "no leading whitespaces",
  trailingWhitespaces: "no trailing whitespaces",
  uncapitalized: "first letter capitalized",
  newlineLeadingWhitespaces: "no leading whitespaces on newlines",
};

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
  },
  create(context) {
    return {
      'ObjectExpression > Property[key.name="description"]': function (node) {
        const propValue = node.value;

        if (
          (propValue.type === "Literal" &&
          typeof propValue.value === "string") ||
          (propValue.type === "TemplateLiteral" &&
          propValue.quasis.length === 1)
        ) {
          const isTemplateLiteral = propValue.type === "TemplateLiteral"

          const problems = [];
          let newString = isTemplateLiteral ? propValue.quasis[0].value.raw : propValue.raw.slice(1, -1); // exclude the StringLiteral op but keep escapes
          if (newString.charAt(0).match(/[\n\s]/g)) {
            problems.push(PROBLEMS.leadingWhitespaces);
            newString = newString.trimStart();
          }
          if (newString.charAt(newString.length - 1).match(/[\n\s]/g)) {
            problems.push(PROBLEMS.trailingWhitespaces);
            newString = newString.trimEnd();
          }
          if (newString.charAt(0) !== newString.charAt(0).toUpperCase()) {
            problems.push(PROBLEMS.uncapitalized);
            newString = newString.charAt(0).toUpperCase() + newString.slice(1);
          }
          if (newString.endsWith(".")) {
            problems.push(PROBLEMS.trailingDot);
            newString = newString.slice(0, -1);
          }
          if (isTemplateLiteral && newString.match(/\n\s+/g)) {
            problems.push(PROBLEMS.newlineLeadingWhitespaces);
            newString = newString.split("\n").filter(s => !!s).map(s => s.trimStart()).join("\n") // remove trailing whitespaces for template literals
          }

          if (problems.length) {
            context.report({
              node: propValue,
              message: `Descriptions should have: ${problems.join(", ")}.`,
              fix(fixer) {
                if (isTemplateLiteral) {
                  return fixer.replaceText(propValue, "`" + newString + "`")
                } else {
                  const d = propValue.raw.slice(0, 1); // keep the original StringLiteral op
                  return fixer.replaceText(propValue, d + newString + d);
                }
              },
            });
          }
        }
      },
    };
  },
};

