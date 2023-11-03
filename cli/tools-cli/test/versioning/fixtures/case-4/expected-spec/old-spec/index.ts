import { createVersionedSpec } from "@fig/autocomplete-helpers";
const versionFiles = ["1.0.0", "2.0.0"];
export const getVersionCommand: Fig.GetVersionCommand = async (executeCommand) => {
  const { stdout } = await executeCommand({
    command: "fig",
    args: ["--version"],
  });
  return stdout.slice(stdout.indexOf(" ") + 1);
};
export default createVersionedSpec("fig", versionFiles);
