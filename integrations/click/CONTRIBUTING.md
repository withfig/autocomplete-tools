### Publishing new Versions

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

### Test the package

Run `python3 -m pytest`.