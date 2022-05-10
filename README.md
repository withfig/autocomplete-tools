# Fig Autocomplete-Tooling Repo

This repo contains the source for all of Fig tools related with [autocomplete](https://github.com/withfig/autocomplete).

1. You can see the list of Fig's packages on the NPM registry here: https://www.npmjs.com/~withfig

2. You can see the source code and related README for each package in the `./packages` folder

## Packages

- [`@fig/autocomplete-generators`](packages/autocomplete-generators/README.md)
- [`@fig/autocomplete-merge`](packages/autocomplete-merge/README.md)
- [`@withfig/autocomplete-tools`](packages/autocomplete-tools/README.md)
- [`@withfig/autocomplete-types`](packages/autocomplete-types/README.md)
- [`@withfig/clap`](packages/clap/README.md)
- [`@withfig/cobra`](packages/cobra/README.md)
- [`@fig/complete-commander`](packages/commander/README.md)
- [`@fig/eslint-config-autocomplete`](packages/eslint-config-autocomplete/README.md)
- [`@withfig/eslint-plugin-fig-linter`](packages/eslint-plugin-fig-linter/README.md)
- [`@withfig/oclif`](packages/oclif/README.md)
- [`@withfig/swift-argument-parser`](packages/swift-argument-parser/README.md)

## To publish a package:

Run `yarn workspace <workspace name> publish`

e.g.
```bash
yarn workspace @withfig/autocomplete-types publish
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

### Docs on `public-site-nextjs`

Docs MUST conform to the rules listed above too.