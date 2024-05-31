const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a", args: { name: "push" } }],
  subcommands: [
    { name: "bar", args: { name: "baz" } },
    {
      name: "foo",
      options: [
        {
          name: "-a",
          args: { name: "push" },
        },
      ],
    },
  ],
};

export default spec;
