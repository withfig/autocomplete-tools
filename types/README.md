# @withfig/autocomplete-types package

This is the package providing types for our autocomplete app.

## Typings for fig autocomplete specs and other tools

Configure the global Fig namespace in your `tsconfig.json`:

```jsonc
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

## Documenting the API
We use [TSDocs](https://tsdoc.org) to comment the exported symbols of the Fig namespace.
In our docs generator, which is executed on our backend each time the types are updated, we perform some custom Typescript AST traversals and we retrieve all the exported nodes with their TSDoc comments.
> For Fig members: see the website repo to find out more about the custom generator we are using for docs

### How are the docs organized once they are parsed from the Typescript AST?

First of all we generate an entire page on the website for each of the main interfaces available in the Fig namespace, all the typealiases go to the "Others" page.

### Supported TSDoc tags and custom JSDoc tags

#### `Interface`
- @filename: to change the target filename of an interface (internal)
- @excluded: do not generate docs for the Interface

#### `Typealias`

- @param: The params of an exported function, the format MUST be `@param <name of the param> <some description>`. It can be provided multiple times for different params.
  ```ts
  /**
   * @param value some description for the value param
   */
  type Callback = (value) => void
  ```
- @returns: An explanation of what is returned by a function.
  ```ts
  /**
   * @param value some description for the value param
   * @returns nothing
   */
  type Callback = (value) => void
  ```
- @remarks: Further details about the implementation of the method, use cases...etc. This data will appear in the `Discussion` section.
- @example: Provide examples about the usage of the API object. It is repeatable.
- @excluded: do not generate docs for the Typealias

#### `Interface` member
- @param: The params of an exported function, the format MUST be `@param <name of the param> <some description>`. It can be provided multiple times for different params.
  ```ts
  /**
   * @param value some description for the value param
   */
  memberName: (value) => void
  ```
- @returns: An explanation of what is returned by a function.
  ```ts
  /**
   * @param value some description for the value param
   * @returns nothing
   */
  memberName: (value) => void
  ```
- @remarks: Further details about the implementation of the method, use cases...etc. This data will appear in the `Discussion` section.
- @example: Provide examples about the usage of the API object. It is repeatable.
- @defaultValue: define the default value of a member.
- @deprecated: Mark an API as deprecated providing an optional message about the deprecation.
  ```ts
  /**
   * @deprecated This message is optional
   */
  export const didChange = {
    subscribe: (notification) => { },
  } 
  ```
- @excluded: do not generate docs for the member
- @category: assign a category to an interface member

#### Custom resolution

We perform some analysis over the types before generating the docs.
In particular all the types from the Fig namespace are replaced recursively with Typescript primitive types like functions, string...

For `Interface members` and `Typealiases` are available some additional tags that prevent complete or partial replacements of the Types.

- @irreplaced: do not replace any Symbol contained in the one tagged
  ```ts
  // e.g. with the irreplaced tag
  type Data = string
  /**
   * @irreplaced
   */
  type Res = Data
  // will output
  type Data = string
  type Res = Data
  ```
  ```ts
  // e.g. without the irreplaced tag
  type Data = string
  type Res = Data
  // will output
  type Data = string
  type Res = string
  ```
- @irreplaceable: this Typealias cannot be replaced in any Symbol that references the tagged one
  ```ts
  // e.g. with the irreplaceable tag
  /**
   * @irreplaceable
   */
  type Data = string
  type Res = Data
  // will output
  type Data = string
  type Res = Data
  ```
  ```ts
  // e.g. without the irreplaceable tag
  type Data = string
  type Res = Data
  // will output
  type Data = string
  type Res = string
  ```
- @replaceFirstLevel: only replaces the direct Symbols contained in the tagged one, then act as @irreplaceable for those Symbols


> IMPORTANT: when using types that reference themselves add an `@irreplaceable` tag to them (see SubcommandDiff)