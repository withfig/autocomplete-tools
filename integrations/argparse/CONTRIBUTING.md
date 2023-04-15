### Publishing new Versions

Prereqs:
- Create a ~/.pypirc
```toml
[testpypi]
  username = __token__
  password = ...
```
(Note that `__token__` is NOT a placeholder)

- Setup required deps
```bash
make bootstrap
```

1. Bump the version in `setup.cfg`
2. `make build`
3. `make publish`

### Test the package

Run `make test`.