const spec: Fig.Spec = {
  name: 'foo',
  description: 'An updated description',
  options: [
    {
      name: '-a',
      args: [
        {},
        {
          generators: () => {},
        },
        {
          isCommand: true,
        },
      ],
      displayName: '-aaa',
    },
  ],
  subcommands: [{ name: 'bar', displayName: 'barbar' }, { name: 'baz' }],
}
export default spec
