## Autogenerate Completions for CLI tools built with `argparse`

This package generates [Fig
completions](https://github.com/withfig/autocomplete) for CLI tools built
with Python's built-in [argparse](https://docs.python.org/3/library/argparse.html) module.

### Installation

Install the integration as a dependency using pip:

```bash
pip install argparse-complete-fig
```

### Usage

```python
import argparse
from argparse_complete_fig import add_completion_spec_command

parser = argparse.ArgumentParser(prog='my-cli')

# Call on your root-level parser for full completions
add_completion_spec_command(parser)
```

Calling the `add_completion_spec_command` function will add
a `--generate-fig-spec` argument to the parser. When your CLI is invoked
with this flag it will print a Fig spec.


To save your completion spec skeleton to a file, run the following:

```bash
my-cli --generate-fig-spec > my-cli.ts
```
