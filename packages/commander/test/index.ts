/* eslint-disable no-continue */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax */
import path from "path";
import fs from "fs";
import child from "child_process";
import chalk from "chalk";

const fixturesPath = path.resolve("test/fixtures/");

function report(fixture: string, successful: boolean) {
  console.log(
    successful
      ? chalk.bgGreen(` ✓ Successfully run ${chalk.underline(fixture)} `)
      : chalk.bgRed(` × Failed running ${chalk.underline(fixture)} `)
  );
}

function runFixtures() {
  let hadErrors = false;
  const fixtures = fs.readdirSync(fixturesPath, { withFileTypes: true });
  for (const fixture of fixtures) {
    if (!fixture.isDirectory()) continue;
    const fixturePath = path.resolve(fixturesPath, fixture.name);

    const command = path.resolve(fixturePath, "command.ts");
    const expected = path.resolve(fixturePath, "expected.ts");
    const output = path.resolve(fixturePath, "output.ts");

    if (!fs.existsSync(command)) {
      hadErrors = true;
      continue;
    }
    try {
      const cmd = `node -r ts-node/register ${command}`;
      child.execSync(cmd);
    } catch {
      console.warn(chalk.bgBlackBright(` - Encountered error when trying to run ${fixture.name}`));
      hadErrors = true;
      continue;
    }

    if (!fs.existsSync(expected) || process.env.OVERWRITE) {
      fs.copyFileSync(output, expected);
      console.log(
        chalk.bgYellow(
          ` - ${process.env.OVERWRITE ? "Regenerated" : "Generated"} ${chalk.underline(
            fixture.name
          )} `
        )
      );
      continue;
    }

    const outputFile = fs.readFileSync(output);
    const expectedFile = fs.readFileSync(expected);

    const successful = outputFile.equals(expectedFile);
    if (!successful) {
      hadErrors = true;
    }
    report(fixture.name, successful);
  }

  if (hadErrors) {
    process.exit(1);
  }
}

runFixtures();
