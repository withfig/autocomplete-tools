# Fig Autocomplete-Tooling Repo

This repo contains the source for all of Fig tools related with [autocomplete](https://github.com/withfig/autocomplete).

1. You can see the list of Fig's packages on the NPM registry here: https://www.npmjs.com/~withfig

2. You can see the source code and related README for each package in the `./packages` folder

## Packages

- [`create-completion-spec`](cli/create-completion-spec/README.md)
- [`@fig/publish-spec`](cli/publih-spec-to-team/README.md)
- [`@withfig/autocomplete-tools`](cli/tools-cli/README.md)
- [`@fig/eslint-config-autocomplete`](eslint/config-autocomplete/README.md)
- [`@withfig/eslint-plugin-fig-linter`](eslint/plugin-fig-linter/README.md)
- [`@fig/autocomplete-generators`](generators/README.md)
- [`@fig/autocomplete-helpers`](helpers/README.md)
- [`argparse_complete_fig`](integrations/argparse/README.md)
- [`cement_complete_fig`](integrations/cement/README.md)
- [`clap_complete_fig`](integrations/clap/README.md)
- [`click_complete_fig`](integrations/click/README.md)
- [`cobracompletefig`](integrations/cobra/README.md)
- [`@fig/complete-commander`](integrations/commander/README.md)
- [`@fig/complete-oclif`](integrations/oclif/README.md)
- [`swift-argument-parser`](integrations/swift-argument-parser/README.md)
- [`@fig/autocomplete-merge`](merge/README.md)
- [`@fig/autocomplete-shared`](shared/README.md)
- [`@withfig/autocomplete-types`](types/README.md)

## To publish a package:

1) Update the `package.json` `version` propery

2) Commit the updated `package.json` file to the origin repo

3) Git tag the commit you have just made using the following format and push the tag to the origin repo
  - The git tag should be: `<package_name>@<new_numerical_version>`
  - Example: `git tag @fig/publish-spec@1.2.3`

4) Run `yarn workspace <workspace name> npm publish`

> **IMPORTANT**: remember to tag the new package version following the current conventions (see the previous tags of a package)
> this is important for some workflows we are running and to keep track of when releases were done.

> **IMPORTANT**: all packages need to be git tagged, not only npm ones!

e.g.
```bash
yarn workspace @withfig/autocomplete-types npm publish
```

> Note: `<workspace name>` is not the name of the folder, but the name specified inside the package.json of the package to publish.

## Conventions for new CLI integration

### Package (integration) name

- If namespaced it SHOULD be `@fig/complete[-_]($FRAMEWORK_NAME)`
- If not namespaced it SHOULD be `($FRAMEWORK_NAME)[-_]complete[-_]fig`

According to language conventions you can use a dash or an underscore to separate the words.

Examples:
- `@fig/complete-commander`
- `@fig/complete-oclif`
- `clap_complete_fig`
- `cobracompletefig`

### Name of the default subcommand added to the CLI

Most of our CLI integration tools allow to set the name of the subcommand added to the CLI but we also provide a default value for that.
That default name MUST be `generate-fig-spec` such that running `$CLI generate-fig-spec` prints the spec.

### Function that adds the command

The functions exported from the integration can:
- Create a new framework subcommand which will print the spec when invoked
- Generate a spec and return it

In all the cases the names are standardized and SHOULD be:
- `addCompletionSpecCommand` or `createCompletionSpecCommand` for functions creating a new subcommand
- `generateCompletionSpec` for functions that return the spec as a string

According to language conventions these function names can be transformed to snake case, etc...

If the CLI tool integration gets added directly to the module of the CLI tool itself and the CLI tool is configured using chained methods (e.g. yargs), then the chain method name SHOULD be:
- `.figCompletion()`

### Docs on `public-site-nextjs`

Docs MUST conform to the rules listed above too.