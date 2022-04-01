const completion: Fig.Subcommand = {
  name: 'fig',
  description: 'Description',
  subcommands: [
    {
      name: 'remove',
      args: { name: "name" },
    },
  ],
}

const versions: Fig.VersionDiffMap = {}

versions['1.0.0'] = {}

export { versions }
export default completion
