# Commander integration
A tool to speed up the workflow of converting [Commander](https://github.com/tj/commander.js) commands to [Fig](https://github.com/withfig/autocomplete) completion spec files.

---

## Docs

```ts
generateFigSpec(command, filename[, options]): void
```

- `command`: a `commander.Command` object
- `filename`: the output filename of the completion spec file
- [`options`](#options): an object containing the following optional properties:
  - [`cwd`](#specify-the-working-directory): specify the working directory in which the file will be saved. It defaults to `process.cwd()`
  - [`figSpecCommandName`](#specify-the-fig-command-name): specify the name of the command used to generate the fig spec ([see](#custom-command)). It defaults to `'generateFigSpec'`

## Usage
Using this library is as simple as calling a function.
The snippet of code below generates a new spec each time the executable file is run.
```js
import { program } from 'commander'
import { generateFigSpec } from '@withfig/commander'

program
  .name('babel')
  .description('The compiler for writing next generation JavaScript')
  .version('7.16.0')
  .argument('<file>', 'file to compile')

// Do not generate if production env
if (process.env.NODE_ENV === 'development') {
  generateFigSpec(program, 'babel-spec.ts' [, options])
}
```

### Custom command
You can also provide a custom command that generates a spec file when called. For example, the program below generates the Fig spec when `eslint generateFigSpec` is run from a Terminal.

```js
program
  .name('eslint')
  .description('Find and fix problems in your JavaScript code')
  .version('8.0.0')
  .argument('<file>', 'file to lint')

if (process.env.NODE_ENV === 'development') {
  program
    .command('generateFigSpec')
    .description('Generate a fig spec')
    .action(() => {
      generateFigSpec(program, 'eslint-spec.ts' [, options])
    })
}
program.parse()
```

> _NOTE: the command can be called whatever you want, but if you specify a name different from `'generateFigSpec'` you should set the [`figSpecCommandName`](#specify-the-fig-command-name) option._

## Options
### Specify the working directory

For example you may want to generate the file in an home directory subfolder for testing purpose.

```js
import path from 'path'
import os from 'os'

...

// this will output to ~/generated/babel-spec.ts
generateFigSpec(program, 'babel-spec.ts', { cwd: path.join(os.homedir(), 'generated') })
```

### Specify the fig command name
When creating a [custom command](#custom-command) to generate a Fig spec whose name is different from `'generateFigSpec'` you want to avoid including it in the generated file. This option helps you do that.

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
      generateFigSpec(program, 'eslint-spec.ts', { figSpecCommandName: 'createSpec' })
    })
}
program.parse()
```

---

_p.s. this tool has been written for `commander@8`, but should work in the most of the previous versions too._

## Contributors
This integration was built by [Federico Ciardi](https://github.com/fedeci/). Please see his repo for previous git history: [https://github.com/fedeci/commander-to-fig](https://github.com/fedeci/commander-to-fig).
