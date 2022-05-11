<p align="center">
    <img width="300" src="https://github.com/withfig/fig/blob/main/static/FigBanner.png?raw=true"/>
</p>

---

![os](https://img.shields.io/badge/os-%20macOS-light)
[![Signup](https://img.shields.io/badge/signup-private%20beta-blueviolet)](https://fig.io?ref=github_autocomplete)
[![Documentation](https://img.shields.io/badge/documentation-black)](https://fig.io/docs/)
[![Discord](https://img.shields.io/discord/837809111248535583?color=768ad4&label=discord)](https://fig.io/community)
[![Twitter](https://img.shields.io/twitter/follow/fig.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=fig)


# Fig Autocomplete Boilerplate Repo

Looking to build [Fig](https://fig.io) autocomplete for private CLI tools, scripts, or NPM packages? This npx module makes it easy to **build** [Fig autocomplete specs](https://fig.io/docs) and **share** them specs with your team.

This repo is similar to a minimal version of our public specs repo,
[withfig/autocomplete](https://github.com/withfig/autocomplete), except with an empty `src/` folder.



## Usage

### Init the .fig folder

Go to the directory that contains your CLI tool, script, or NPM package and run the following

```bash
npx @withfig/autocomplete-tools init
```
This will create initialise a `.fig/` folder in your current working directory like the following
```bash
cli/
├── .fig/
│   └── autocomplete/
│       ├── src/                # where you edit your completion specs
│       ├── build/              # where your specs compile to
│       ├── .eslintrc.js
│       ├── README.md
│       ├── package-lock.json
│       ├── package.json
│       └── tsconfig.json
├── node_mod/
└── my_cli_tool.sh
```

### Create, test, and compile specs

`cd` into the `.fig/autocomplete/` folder and run the remaining commands as package.json scripts

```bash
# Make a new empty completion spec object in src/ 
npm run create-spec

# Start dev mode to see live updates to your spec in your terminal as you edit.
npm run dev

# Compile your specs from the src/ folder to build/
npm run build
```

### Push Specs to Fig's Cloud
Coming soon

## Documentation

- [Building your first autocomplete spec](https://fig.io/docs/)
- [Personal shortcut autocomplete](https://fig.io/docs/tutorials/visual-shortcuts)
- [Autocomplete for teams / internal CLI tools](https://fig.io/docs/tutorials/building-internal-clis)
- [Autocomplete for local scripts](https://fig.io/docs/tutorials/autocomplete-for-internal-scripts)


## 😊 Need Help?

Email [hello@fig.io](mailto:hello@fig.io)

<p align="center">
    Join our community
<br/>
<a href="https://fig.io/community">
    <img src="http://fig.io/icons/discord-logo-square.png" width="80px" height="80px" /> 
</a>
</p>
