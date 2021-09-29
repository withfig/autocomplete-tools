# Fig Autocomplete-Tooling Repo

This repo contains the source for all of Fig tools related with [autocomplete](https://github.com/withfig/autocomplete).

1. You can see the list of Fig's packages on the NPM registry here: https://www.npmjs.com/~withfig

2. You can see the source code and related README for each package in the `./packages` folder

### To publish a package:

Run `yarn workspace <workspace name> publish`

e.g.
```bash
yarn workspace @withfig/autocomplete-types publish
```

> Note: `<workspace name>` is not the name of the folder, but the name specified inside the package.json of the package to publish.

### Migration from `@withfig/autocomplete-tools@1` to `@withfig/autocomplete-tools@2`

In v2 we moved our types to a separate package called `@withfig/autocomplete-types`.
The transition is as simple as installing the new package and changing an entry in your `tsconfig.json`:
```json
{
  "compilerOptions": {
    ...
    // you may get some typecheck errors if you are using some node packages like "fs"
    // just include "node" in the below array. Same for "jest", "chai"...and so on
    "types": ["@withfig/autocomplete-types"]
  },
  ...
}
```
```
