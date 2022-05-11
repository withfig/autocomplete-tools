# Migration from `@withfig/autocomplete-tools@1` to `@withfig/autocomplete-tools@2`

In v2 we moved our types to a separate package called `@withfig/autocomplete-types`.
The transition is as simple as installing the new package and changing an entry in your `tsconfig.json`:
```json
{
  "compilerOptions": {
    // you may get some typecheck errors if you are using some node packages like "fs"
    // just include "node" in the below array. Same for "jest", "chai"...and so on
    "types": ["@withfig/autocomplete-types"]
  },
}
```