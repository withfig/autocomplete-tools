const spec: Fig.Spec = {
  name: 'foo',
  description: 'An updated description',
  options: [{ name: '-a' }],
  subcommands: [{ name: 'bar', displayName: 'barbar' }, { name: 'foo' }],
}
export default spec
function foo() {
  return 1
}
const a = 100
