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
- [`@withfig/commander`](packages/commander/README.md)
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
