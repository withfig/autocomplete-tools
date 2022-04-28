## Autogenerate Completions for CLI tools built with `click`


Add the integration to your CLI tool:

```bash
pip install fig-click-completions
```

Add new subcommand to your CLI tool.
- You must pass in the root level CLI.
- Note: make sure you use the name `generate_fig_spec`.

```python
from fig_click_completions import fig

...

@cli.command()
def generate_fig_spec():
    fig.print_completion_spec(cli)

cli.add_command(generate_fig_spec)
```

You can now automatically generate the completion spec skeleton by running the following command:

```bash
$CLI generate-fig-spec > $CLI.ts
```

### Updating

Prereqs:
- Create a ~/.pypirc
```toml
[testpypi]
  username = __token__
  password = ...
```
(Note that `__token__` is NOT a placeholder)

- Install `twine`
```bash
python3 -m pip install --upgrade twine
```

1. Bump the version in `setup.cfg`
2. `python3 -m build`
3. `twine upload dist/*`