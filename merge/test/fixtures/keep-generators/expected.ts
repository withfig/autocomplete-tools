const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [
    {
      name: "-a",
      args: {
        name: "push",
        generators: {
          script: "foo",
          postProcess: (out) => [],
        },
      },
    },
  ],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};
export default spec;
