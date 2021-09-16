<p align="center">
    <img width="300" src="https://github.com/withfig/fig/blob/main/static/FigBanner.png?raw=true"/>
</p>

---

![os](https://img.shields.io/badge/os-%20macOS-light)
[![Signup](https://img.shields.io/badge/signup-private%20beta-blueviolet)](https://fig.io?ref=github_autocomplete)
[![Documentation](https://img.shields.io/badge/documentation-black)](https://fig.io/docs/)
![Discord](https://img.shields.io/discord/837809111248535583?color=768ad4&label=discord)
[![Twitter](https://img.shields.io/twitter/follow/fig.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=fig)

# Autocompletion Boilerplate

This repository is a template for **individuals / teams looking to build autocomplete specs for private CLIs and scripts** (ie scripts that they do not want to make public).

This repo is similar to a minimal
[withfig/autocomplete](https://github.com/withfig/autocomplete) with an empty `src/` folder (you can create this with `npm run create-boilerplate`)

## Documentation

- Main docs: [fig.io/docs](https://fig.io/docs/)
- Autocomplete for personal shortcuts: [fig.io/docs/tutorials/visual-shortcuts](https://fig.io/docs/tutorials/visual-shortcuts)
- Autocomplete for teams: [fig.io/docs/tutorials/building-internal-clis](https://fig.io/docs/tutorials/building-internal-clis)

## Using this repo

Build your first spec in < 3 min: [fig.io/docs/getting-started](https://fig.io/docs/getting-started)

```bash
# Create a .fig/autocomplete/ directory.
npx @withfig/autocomplete-tools init

# Move to the newly created directory.
cd .fig/autocomplete/

# Make a new empty spec called abc.
npm run create-spec abc

# Start dev mode to see live updates to your spec as you edit.
npm run dev
```

Now go to your terminal and type `abc[space]`. Your example spec will appear. 😊

#### Other things to know

- Edit your spec in typescript in the `src/` folder
- On save, specs are compiled to the `build/` folder
- In **dev mode** specs are read from the `build/` folder. Otherwise they are read from `~/.fig/autocomplete`

<br/>

## Save My Spec for Personal use

Compile your spec then save it to your `~/.fig/autocomplete` folder

```bash
# Compile your spec(s) to the specs/ folder
npm run build

# Copy your spec from the specs/ folder to the ~/.fig/autocomplete folder
npm run copy <spec-name>
```

## Share my Spec with My Team

Compile your spec(s) to the `specs/` folder

```bash
# Compile your spec
npm run build

# Commit your changes and push to your repo
git add .
git commit -m "my message"
git push origin master
```

Now have your team clone your repo and then copy all the specs over to their ~/.fig/autocomplete folder

```
git clone https://github.com/YOUR_GITHUB_USERNAME/fig-autocomplete-private.git fig-autocomplete-private
cd fig-autocomplete-private

# Copy all specs from the specs/ folder to the ~/.fig/autocomplete folder
npm run copy:all
```

**Alternatively**, you can simply share your compiled `.js` file with anyone (e.g. through email or Slack). Once they put the file in their `~/.fig/autocomplete` folder, it will start working!

> **Note**: Fig is working on providing a much better experience for sharing specs with your team. We are hoping to launch it very soon.

## Other available package.json commands

```bash

# Create a new spec from a boilerplate template
npm run create-boilerplate

# Typecheck all specs in the dev/ folder
npm test

# Compile typescripts specs from dev/ folder to specs/ folder
npm run build

# Copy all specs from the specs/ folder to the ~/.fig/autocomplete folder
npm run copy:all

# Copy an individual spec from the specs/ folder to the ~/.fig/autocomplete folder
npm run copy <spec-name>
```

## 😊 Need Help?

Email [hello@fig.io](mailto:hello@fig.io)

<p align="center">
    Join our community
<br/>
<a href="https://fig.io/community">
    <img src="http://fig.io/icons/discord-logo-square.png" width="80px" height="80px" /> 
</a>
</p>
