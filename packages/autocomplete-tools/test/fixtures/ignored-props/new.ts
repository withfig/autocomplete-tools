const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a", default: true }],
  subcommands: [
    { name: "bar", displayName: "bar" },
    { name: "foo", default: false },
  ],
};

export default spec;
