const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a", args: { name: "push"} }],
  subcommands: [{ name: "bar" }, { name: "foo" }],
};

export default spec;
