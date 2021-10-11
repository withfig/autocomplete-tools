const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ name: "-a", displayName: "-aaa" }],
  subcommands: [{ name: "bar", displayName: "barbar", hidden: true }, { name: "foo", default: true }],
};

export default spec;
