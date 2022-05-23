const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a", args: [{}, {}, {}] }],
  subcommands: [{ name: "bar" }, { name: "baz" }],
};

export default spec;
