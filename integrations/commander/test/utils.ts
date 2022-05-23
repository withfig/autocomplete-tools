/* eslint-disable import/no-extraneous-dependencies */
import chalk from "chalk";

type ReportStatus = "successful" | "failed" | "errored" | "regenerated" | "generated";

export function report(fixtureName: string, status: ReportStatus): void {
  let message;
  switch (status) {
    case "successful":
      message = chalk.bgGreen(` ✓ Successfully run ${chalk.underline(fixtureName)} `);
      break;
    case "failed":
      message = chalk.bgRed(` × Failed running ${chalk.underline(fixtureName)} `);
      break;

    case "errored":
      message = chalk.bgBlackBright(` - Encountered error when trying to run ${fixtureName}`);
      break;

    default:
      message = chalk.bgYellow(
        ` - ${status === "regenerated" ? "Regenerated" : "Generated"} ${chalk.underline(
          fixtureName
        )} `
      );
  }
  console.log(message);
}
