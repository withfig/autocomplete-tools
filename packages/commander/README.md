# Commander integration
A tool to speed up the workflow of converting [Commander](https://github.com/tj/commander.js) commands to [Fig](https://github.com/withfig/autocomplete) completion spec files.

---

## Docs

```ts
generateFigSpec(command, filename[, options]): void
```

- `command`: a `commander.Command` object
- `filename`: the output filename of the completion spec file
- `options`: an object containing the following optional properties:
  - `cwd`: specify the working directory in which the file will be saved. It defaults to `process.cwd()`

## Usage

Using this library is as simple as importing a function and calling it.

```js
import { program } from 'commander'
import { generateFigSpec } from '@withfig/commander'

program
  .name('babel')
  .description('The compiler for writing next generation JavaScript')
  .version('1.0.0')
  .argument('<file>', 'file to compile')

generateFigSpec(program, 'babel-spec.ts')
```

### Specify the working directory

For example you may want to generate the file in an home directory subfolder for testing purpose.

```js
import path from 'path'
import os from 'os'

...

// this will output to ~/generated/babel-spec.ts
generateFigSpec(program, 'babel-spec.ts', { cwd: path.join(os.homedir(), 'generated') })
```

---

_p.s. this tool has been written for `commander@8`, but should work in the most of the previous versions too._
