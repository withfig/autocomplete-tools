const completion: Fig.Subcommand = {
  name: "fig",
  description: "Updated description",
  subcommands: [
    {
      name: "update",
      description: "New command description",
    },
    {
      name: "remove",
    },
  ],
};

const versions: Fig.VersionDiffMap = {};

versions["1.1.0"] = {};

export { versions };
export default completion;
