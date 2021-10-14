## Typings for fig autocomplete specs and other tools

Configure the global Fig namespace in your `tsconfig.json`:

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