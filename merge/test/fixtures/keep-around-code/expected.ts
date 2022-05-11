function foo() {
  return 1;
}
const a = 100;
const spec: Fig.Spec = {
  name: "foo",
  description: "An updated description",
  options: [{ name: "-a" }],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};
function bar() {
  return "hello";
}
export default spec;
function zoo() {
  return {};
}
