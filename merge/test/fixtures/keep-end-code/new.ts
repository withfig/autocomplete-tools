const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a" }],
  subcommands: [{ name: "bar" }, { name: "foo" }],
};

export default spec;
