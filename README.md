# Standards

This repo is a boilerplate repo for a a new JS/TS app built at Fig. It has all the standards we use + comments

There is a lot of boilerplate js specific stuff around Fig.

Tools we use, relevant files, relevant links, and soon descriptions for each.

### Typescript

**Important Files:**

- tsconfig.json

Typescript is used for static typechecking to catch errors on build time rather than run time. Types can be checked using the command
`npm run build:dry`. This file probably doesn't need to be touched throughout the development process anymore.

### Vite

**Important Files:**

- vite.config.ts

[Vite](https://vitejs.dev/) is a modern and fast frontend bundling tool which is used for the development process as well as creating production builds. Only thing to keep in mind is, that if we want to support older browsers, we need to enable the [legacy mode](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

### Jest

**Important Files:**

- jest.config.ts
- \*.test.ts

Jest is a simple and battle-tested test runner which is used for unit / integration tests. Further information [here](https://jestjs.io/)

### ESLint

**Important Files:**

- .eslintrc.js

Eslint is a linting tool which is used to find code smells and enforce a good code style with strict rules. We built our config upon the rules from airbnb which are used in many projects and enforce a clean and good code style. An overview of all rules can be found [here](https://github.com/airbnb/javascript)

### VSCode

**Important Files:**

- .vscode/settings.json

We decide to use VSCode as our IDE for JS/TS projects. This file allows us to define settings for this folder which sets up automatic linting etc. You can read more about those settings [here](https://code.visualstudio.com/docs/getstarted/settings)

### Husky

**Important Files:**

- .husky

Husky is an easy git hooks integration which allows us to format code and check it before a commit is made to only allow "clean" code in the main branch

### Prettier

- `prettier` key in .eslintrc.js

Prettier is an opinionated code formatter which has strict rules for formatting (e.g. only use double quotes).

### lint-staged

- `lint-staged` key in package.json

Lint staged is run by husky and checks and formats staged files before commiting

### Github

- .github/ folder in root

Github Actions which are used for our CI/CD Pipeline

### FAQ

_Q: I'm lazy, what is this all about?:_

A:
| Tool | Purpose | Docs | Touch it? |
| --------------- | -------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| TypeScript | Static Typechecking | [Docs](https://www.typescriptlang.org/) | Probably never |
| Vite | Bundling | [Docs](https://vite.dev) | Probably never |
| Jest | Unit tests | [Docs](https://jestjs.io/) | config -> never. Tests always |
| Eslint | Code analysis | [Docs](https://eslint.org/) | Nope, we chose good defaults |
| VSCode Settings | IDE | [Docs](https://code.visualstudio.com/docs/getstarted/settings) | Probably never |
| Husky | Git hooks | [Docs](https://typicode.github.io/husky/#/) | Only when adding a new git hook (e.g. pre-push) |
| Prettier | Code formatting | [Docs](https://prettier.io/docs/en/options.html) | Only when cloning this repo. We chose good defaults |
| Lint-Staged | Run eslint on staged files | [Docs](https://github.com/okonet/lint-staged) | Only if new file types are added |
| Github Actions | CI/CD | [Docs](https://docs.github.com/en/actions) | When adding or updating the CD |

_Q: What is the difference between Prettier and Eslint?:_

A: Even though both tools look similar at a first glance, they have dedicated uses and work really well in conjunction with each other.

_Eslint:_ Eslint is a Linter which analyzed your code while developing and warns you about dangerous and/or unwanted code. An example rule is that a user should not re-assign a parameter, but rather create a new variable. Some of those rules are opinionated and can be configured/toggled. The rules can be configured with three levels of severity. The first level is "off" (0) which means that the eslint won't check the code for this rule. The second level is "warning" (1) which means that eslint won't fail when this rule is violated, but rather show a warning. The last level is "error" (2) which means that the eslint cli will throw an error and you are not allows to push code!

_Prettier:_ Prettier is a heavily opinionated code formatter which only has a couply of configuration options. Prettier looks at coding styles like the quote style. It will then only allow one type of quotes being used. Prettier should allow the developer to not worry about the way he codes but rather the content of the code
