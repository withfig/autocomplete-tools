## Typings for fig autocomplete specs and other tools

Configure the global Fig namespace in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    // you may get some typecheck errors if you are using some node packages like "fs"
    // just include "node" in the below array. Same for "jest", "chai"...and so on.
    "types": ["@withfig/autocomplete-types"]
  },
}
```

### FAQs

- I have done everything described above but I can't get my IDE (e.g. VSCode) to detect the autocomplete types, what can I do?
You should try some of the following steps:
1) Restart the IDE
2) Delete your `node_modules/` folder and reinstall again the packages
3) Restart the system

If you are still unable to use `@withfig/autocomplete-types`, please open an issue [here](https://github.com/withfig/autocomplete-tools/issues).