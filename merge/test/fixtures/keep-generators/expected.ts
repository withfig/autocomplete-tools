const generator: Fig.Generator = {
  custom: async (tokens) => [
    {
      name: tokens[0],
    },
  ],
};
const generatorMap = {
  foo: {
    script: ["foo"],
  } as Fig.Generator,
};
const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [
    {
      name: "-a",
      args: {
        name: "push",
        generators: {
          script: ["foo"],
          postProcess: (out) => [
            {
              name: out,
            },
          ],
        },
      },
    },
  ],
  subcommands: [
    {
      name: "bar",
      args: { name: "baz", generators: generator },
      displayName: "barbar",
    },
    {
      name: "foo",
      options: [
        {
          name: "-a",
          args: { name: "push", generators: generatorMap.foo },
        },
      ],
    },
  ],
};
export default spec;
