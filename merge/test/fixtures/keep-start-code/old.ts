function foo() {
  return 1;
}

const a = 100;

const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ name: "-a" }],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};

export default spec;
