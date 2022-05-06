import path from "path";
import fs from "fs";
import readline from "readline";
import pc from "picocolors";

const fileContent = (name: string) => `const completionSpec: Fig.Spec = {
  name: "${name}",
  description: "",
  subcommands: [{
    name: "my_subcommand",
    description: "Example subcommand",
    subcommands: [{
      name: "my_nested_subcommand",
      description: "Nested subcommand, example usage: '${name} my_subcommand my_nested_subcommand'"
    }],
  }],
  options: [{
    name: ["--help", "-h"],
    description: "Show help for ${name}",
  }],
  // Only uncomment if ${name} takes an argument
  // args: {}
};
export default completionSpec;`;

export function createCompletionSpec(specName: string, autocompleteFolder: string) {
  const sanitizedSpecName = specName.replace(" ", "-");
  const filePath = path.join(autocompleteFolder, `${sanitizedSpecName}.ts`);
  const dirName = path.dirname(filePath); // we do not use parentDir directly cause specName may be nested e.g. `aws/spec`

  if (fs.existsSync(filePath)) {
    console.log(pc.red("This completion spec already exists"));
    console.log(pc.bold(`Start editing it from the src/${sanitizedSpecName}.ts now!`));
  }
  fs.mkdirSync(dirName, { recursive: true });
  fs.writeFileSync(filePath, fileContent(sanitizedSpecName));
  console.log(pc.green(`Successfully created the new Spec ${sanitizedSpecName}`));
  console.log(`Start editing it at ${pc.bold(`src/${sanitizedSpecName}.ts`)}!`);
}
