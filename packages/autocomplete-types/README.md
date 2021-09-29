## Typings for fig autocomplete specs and other tools

Configure the global Fig namespace in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    ...
    "typeRoots": [
      "node_modules/@types",
      "node_modules/@withfig/autocomplete-types/"
    ]
  },
  ...
}
```