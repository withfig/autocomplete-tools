# Merge tool docs

The merge tool is an handy tool that helps to merge different versions of specs.

## How it works

Basically it keeps everything from the old spec apart from the properties specified in the preset or in the options.

## Presets

We provide some presets to be used along with our [integrations](https://fig.io/docs/guides/autocomplete-for-teams#next-steps).

For example if you regenerated a spec after an update to your CLI structure you can easily pass the `--preset <name>` option to the merge tool 
and it will merge the two specs like magic keeping the options you customized in the old one but also adding, removing and updating everything new.
```
npx @withfig/autocomplete-tools@latest merge old-spec.ts new-spec.ts --preset commander
```
> See a live example directly in this repo [package.json](https://github.com/withfig/autocomplete-tools/blob/262cc31134e95e50ee546c67d343ea6661e17592/packages/autocomplete-tools/package.json#L11).

## Further customization

If you are not using any of our integrations because you built some custom generator for your specs, 
then you can customize how the merge tool behaves through some options:
- `--ignore-command-props <props>`: the **command** props that should always be overridden
- `--ignore-option-props <props>`: the **option** props that should always be overridden
- `--ignore-arg-props <props>`: the **arg** props that should always be overridden

There is also another option that allows to specify some kind of props that should always be overridden in each of the contexts specified above:
- `-i, --ignore-props <props>`: the props that should always be overridden

### How all these options will help me?

Well, if you built a custom spec generatio tool for sure you are only autogenerating some of the several props that Fig's Autocomplete allows you to add to a spec,
and maybe you are adding some props manually after the generation. With the options mentioned above you can tell the merge tool which are the properties that you are 
autogenerating so that it keeps those always updated while still maintaining your manual edits.
