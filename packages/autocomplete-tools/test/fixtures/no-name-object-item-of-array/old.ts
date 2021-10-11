const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ name: "-a", displayName: "-aaa", args: [{}, { generators: () => {} }, { isCommand: true }] }],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};

export default spec;
