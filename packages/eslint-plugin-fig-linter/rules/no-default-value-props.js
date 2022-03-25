module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    // [{path: "options.[*].isOptional", defaultValue: "true"}]
    schema: [{
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          // check if `anyliteral` exists
          defaultValue: { type: "any" }
        }
      }
    }],
  },
  create(context) {
    function checker(propName, defaultValue) {
      return (node) => {
        const nodeValue = node.value;
        // see if it is possible to resolve the map
        if (nodeValue.type === "Literal" && nodeValue.value === defaultValue) {
          context.report({
            node,
            message:
              `The ${propName} prop if ${defaultValue} by default and can be omitted`,
            fix(fixer) {
              const [start, end] = node.range;
              return fixer.removeRange([start, end + 1]);
            },
          });
        }
      }
    }

    return context.options[0].reduce((traverseObject, setting) => {
      const { path, defaultValue } = setting
      const pathComponents = path.split(".")
      pathComponents.reduce((previousTraversePaths, component) => {
        return previousTraversePaths.flatMap((currentPath) => {
          if (component.startsWith("[*]")) {
            const returnedPaths = []
            if (component.endsWith("?")) {
              returnedPaths.push(currentPath)
            }
            returnedPaths.push(currentPath + 'ArrayExpression > ')
            return returnedPaths
          } else {
            return `${currentPath}ObjectExpression > Property[key.name="${component}"] > `
          }
        })
      }, [""]).map(path => path.slice(0, -3)).forEach(traversePath => {
        traverseObject[traversePath] = checker(pathComponents[pathComponents.length - 1], defaultValue)
      });
      return traverseObject
    }, {})
  },
};
