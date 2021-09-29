const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ name: "-a", displayName: "-aaa" }],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};

export default spec;
