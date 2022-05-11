# Commander integration
A tool to speed up the workflow of converting [Commander](https://github.com/tj/commander.js) commands to [Fig](https://github.com/withfig/autocomplete) completion spec files.

---

## Docs

```ts
generateCompletionSpec(command[, options]): string
```
Generate a completion spec from the provided command and return it a string.
- `command`: a `commander.Command` object
- [`options`](#options): an object containing the following optional properties:
  - [`figSpecCommandName`](#specify-the-fig-command-name): specify the name of the command used to generate the fig spec ([see](#custom-command)). It defaults to `'generate-fig-spec'`

```ts
addCompletionSpecCommand(command): void
```
Add a new Subcommand to the provided command that will print a spec generated when invoked through `$CLI generate-fig-spec`.
- `command`: a `commander.Command` object


## Usage
Using this library is as simple as calling a function.
The snippet of code below generates a new spec each time the executable file is run.
```js
import { program } from 'commander'
import { generateCompletionSpec } from '@fig/complete-commander'

program
  .name('babel')
  .description('The compiler for writing next generation JavaScript')
  .version('7.16.0')
  .argument('<file>', 'file to compile')

// Do not generate if production env
if (process.env.NODE_ENV === 'development') {
  const spec = generateCompletionSpec(program) // write the generated spec to a file or print it to the console
}
```

### Custom command
You can also provide a custom command that generates a spec file when called. For example, the program below generates the Fig spec when `eslint generate-fig-spec` is run from a Terminal.

```js
import { program } from 'commander'
import { addCompletionSpecCommand } from '@fig/complete-commander'

program
  .name('eslint')
  .description('Find and fix problems in your JavaScript code')
  .version('8.0.0')
  .argument('<file>', 'file to lint')

if (process.env.NODE_ENV === 'development') {
  addCompletionSpecCommand(program)
}
program.parse()
```

> _NOTE: the command can be called whatever you want, but if you specify a name different from `'generate-fig-spec'` you should set the [`figSpecCommandName`](#specify-the-fig-command-name) option._

## Options for `generateCompletionSpec`
### Specify the fig command name
When creating a [custom command](#custom-command) to generate a Fig spec whose name is different from `'generateCompletionSpec'` you want to avoid including it in the generated file. This option helps you do that.

```js
program
  .name('eslint')
  .description('Find and fix problems in your JavaScript code')
  .version('8.0.0')
  .argument('<file>', 'file to lint')

if (process.env.NODE_ENV === 'development') {
  program
    .command('createSpec') // this command will not be included in the generated spec
    .description('Generate a fig spec')
    .action(() => {
      generateCompletionSpec(program, { figSpecCommandName: 'createSpec' })
    })
}
program.parse()
```

---

_p.s. this tool has been written for `commander@8`, but should work in the most of the previous versions too._

## Contributors
This integration was built by [Federico Ciardi](https://github.com/fedeci/). Please see his repo for previous git history: [https://github.com/fedeci/commander-to-fig](https://github.com/fedeci/commander-to-fig).
