import { Process } from "@withfig/api-bindings";
import { useEffect, useState } from "react";

type ExecuteCommandOutput =
  | {
      status: "loading";
    }
  | {
      status: "success";
      exitCode: number;
      stdout: string;
      stderr: string;
    }
  | {
      status: "error";
      error: Error;
    };

export const useExecuteCommand = (
  input: { command: string } | { args: string[] }
): ExecuteCommandOutput => {
  let executable: string;
  let args: string[];
  if ("command" in input && input.command) {
    executable = "bash";
    args = ["-c", input.command];
  } else if ("args" in input && input.args.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    executable = input.args[0];
    args = input.args.slice(1);
  } else {
    throw new Error("Invalid input");
  }

  const [output, setOutput] = useState<ExecuteCommandOutput>({
    status: "loading",
  });

  useEffect(() => {
    Process.run({
      executable,
      args,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      terminalSessionId: window?.globalTerminalSessionId,
    })
      .then(({ exitCode, stderr, stdout }) => {
        setOutput({
          status: "success",
          exitCode,
          stderr,
          stdout,
        });
      })
      .catch((error) => {
        setOutput({
          status: "error",
          error,
        });
      });
  }, [executable, args]);

  return output;
};
