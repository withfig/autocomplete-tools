## Autogenerate Completions for CLI tools built with `click`


### Add the integration to your CLI tool:

```bash
pip install click_complete_fig
```

#### Add new subcommand to your CLI tool.
- You must pass in the root level CLI.
- The `add_completion_spec_command` function will add a new `generate-fig-spec` to the passed in `cli`

```python
from click_complete_fig import fig

@click.group()
def cli():
    pass

fig.add_completion_spec_command(cli)
```

> NOTE: be sure to use `add_completion_spec_command` on a `@click.group` wrapped function and not on a `@click.command` wrapped one.
> Links: https://click.palletsprojects.com/en/8.0.x/commands/#commands-and-groups

You can now automatically generate the completion spec skeleton by running the following command:

```bash
$CLI generate-fig-spec > $CLI.ts
```

#### Generate a completion spec without adding a command to the CLI

```python
from click_complete_fig import fig

@click.command()
def cli():
    pass

fig.generate_completion_spec(cli) # Will print the spec as long as the .py script is run
```

> NOTE: this works both with `@click.group` and `@click.command` wrapped functions.
