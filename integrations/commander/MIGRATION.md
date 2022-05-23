# Migration docs

## @withfig/commander@1 to @fig/complete-commander@2

The first granted thing you can note is that we renamed the package to use the `@fig` namespace and a more significative name.

This is not the only change occurred because we also changed the name, the signature, the options and the effects of the `generateFigSpec` function:
- In v1 the main function was `generateFigSpec` while now it is named `generateCompletionSpec`
- In v1 you had to specify a file as the destination of the spec while in v2 the spec gets returned as a `string` from `generateCompletionSpec`.
- In v1 the name of the default command added to the commander program was `generateFigSpec` while in v2 it is `generate-fig-spec`
