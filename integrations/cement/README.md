## Autogenerate Completions for CLI tools built with `cement`

This package generates [Fig
completions](https://github.com/withfig/autocomplete) for CLI tools built
on [Cement](https://builtoncement.com/).


### Installation

Install the integration as a dependency using pip:

```bash
pip install cement_complete_fig
```

### Usage

Choose one of the methods below to add the `generate-fig-spec`
subcommand to the top level of your CLI tool.

#### Method 1: Load as a Cement extension

This package provides a [Cement
extension](https://docs.builtoncement.com/core-foundation/extensions-1)
for convenience called `'cement_complete_fig.ext.ext_complete_fig'`
which can be loaded in any of the ways cited in the linked documentation.

Repeated here for convenience you can do one of the following:

1. Add the extension to the `Meta` of your `App` object:

```python
from cement import App

class MyApp(App):
    class Meta:
        label = 'myapp'
        extensions = [
            ...,
            'cement_complete_fig.ext.ext_complete_fig'
       ]
```


2. Manually load the extension before running your app:

```python
from cement import App

with App('myapp') as app:
    app.ext.load_extension('cement_complete_fig.ext.ext_complete_fig')

    app.run()
```

3. Add the extension to your app configuration file (e.g. `.myapp.conf`):

```toml
[myapp]
exensions = cement_complete_fig.ext.ext_complete_fig
```

#### Method 2: Bind the controller manually

You can also add the `GenerateFigSpecController` manually as a handler to your
app:

```python
from cement import App
from cement_complete_fig import GenerateFigSpecController

class MyApp(App):
    class Meta:
        label = 'myapp'
        handlers = [
            ...,
            GenerateFigSpecController
        ]

with MyApp() as app:
    app.run()
```

### Generating the spec file

Once you've added the integration you will have new subcommand nested
under your base handler.  When this subcommand is invoked it will print
a Fig spec.

To save your completion spec skeleton to a file, run the following:

```bash
myapp generate-fig-spec > myapp.ts
```
