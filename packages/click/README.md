## Autogenerate Completions for CLI tools built with `click`


Add the integration to your CLI tool:

```bash
pip install click_complete_fig
```

Add new subcommand to your CLI tool.
- You must pass in the root level CLI.
- The `add_completion_spec_command` function will add a new `generate-fig-spec` to the passed in `cli`

```python
from click_complete_fig import fig

@click.group()
def cli():
    pass

fig.add_completion_spec_command(cli)
```

You can now automatically generate the completion spec skeleton by running the following command:

```bash
$CLI generate-fig-spec > $CLI.ts
```
