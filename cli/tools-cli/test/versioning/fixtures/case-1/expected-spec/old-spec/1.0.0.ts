const completion: Fig.Subcommand = {
  name: "fig",
  description: "Description",
  subcommands: [
    {
      name: "remove",
      args: { name: "name" },
    },
  ],
};

const versions: Fig.VersionDiffMap = {};

versions["1.0.0"] = {};

versions["1.1.0"] = {
  description: "Updated description",
  subcommands: [
    {
      name: "update",
      description: "New command description",
    },
  ],
};

export { versions };
export default completion;
