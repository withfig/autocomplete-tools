// Autogenerated by @fig/complete-commander

const completionSpec: Fig.Spec = {
  name: "",
  options: [
    {
      name: ["-c", "--color"],
      description: "specify the color",
      args: { name: "type", default: "blue" },
    },
    { name: ["-n", "--number"], args: { name: "type", default: "1" } },
    { name: ["-a", "--arr"], args: { name: "type", default: "1,2,3" } },
    {
      name: ["-h", "--help"],
      description: "display help for command",
      priority: 49,
    },
  ],
};

export default completionSpec;

