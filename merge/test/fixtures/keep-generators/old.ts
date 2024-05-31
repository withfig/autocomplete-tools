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
  description: "A simple description",
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
      displayName: "barbar",
      args: { name: "baz", generators: generator },
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
