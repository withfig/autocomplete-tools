// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from "@oclif/test";

describe("hello", () => {
  test
    .stdout()
    .command(["generateFigSpec"])
    .it("runs hello cmd", (ctx) => {
      expect(ctx.stdout).to.equal("hello friend from oclif!");
    });
});
