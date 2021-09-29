const spec: Fig.Spec = {
  name: "foo",
  description: "A simple description",
  options: [{ 
    name: "-a", 
    args: { 
      name: "push", 
      generators: { 
        script: "foo", 
        postProcess: (out) => { 
          return [] 
        } 
      } 
    } 
  }],
  subcommands: [{ name: "bar", displayName: "barbar" }, { name: "foo" }],
};

export default spec;
