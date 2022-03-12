const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ name: "-a" }],
  subcommands: [{ name: "bar", icon: "it should still be here" }, { name: "foo" }],
};

export default spec;
