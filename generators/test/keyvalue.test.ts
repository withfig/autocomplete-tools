import { expect } from "chai";
import { keyValue, keyValueList } from "..";

function kvSuggestionsTest(
  generator: Fig.Generator
): (token: string, expected: Fig.Suggestion[]) => Promise<void> {
  return async (token, expected) => {
    const result = await generator.custom?.(["spec", token], () => Promise.resolve(""), {
      currentProcess: "",
      currentWorkingDirectory: "",
      sshPrefix: "",
    });
    expect(result).to.deep.equal(expected);
  };
}

function kvQueryTermTest(gen: Fig.Generator): (token: string, expected: string) => void {
  const { getQueryTerm } = gen;
  expect(getQueryTerm).to.be.a("function");
  // @ts-ignore
  return (token, expected) => expect(getQueryTerm(token)).to.equal(expected);
}

function kvTriggerTest(
  gen: Fig.Generator
): (newToken: string, oldToken: string, trigger: boolean) => void {
  const { trigger } = gen;
  expect(trigger).to.be.a("function");
  // @ts-ignore
  return (newToken, oldToken, expected) => expect(trigger(newToken, oldToken)).to.equal(expected);
}

describe("Test keyValue suggestions", () => {
  it("has the correct query term", () => {
    const test = kvQueryTermTest(keyValue({}));
    test("", "");
    test("key", "key");
    test("key=", "");
    test("key=val", "val");
  });

  it("triggers correctly", () => {
    const test = kvTriggerTest(keyValue({}));
    test("", "", false);
    test("", "a", false);
    test("key", "key=", true);
    test("key=", "key", true);
    test("key=", "key=v", false);
    test("key=val", "key=val=", false);
  });

  it("suggests keys and values correctly", async () => {
    const test = kvSuggestionsTest(
      keyValue({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: ":",
      })
    );
    await test("", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test(":", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:val", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("runs functions", async () => {
    const test = kvSuggestionsTest(
      keyValue({
        keys: () => Promise.resolve([{ name: "key" }]),
        values: () => Promise.resolve([{ name: "value" }]),
        separator: ":",
      })
    );
    await test("", [{ name: "key" }]);
    await test("key", [{ name: "key" }]);
    await test(":", [{ name: "value" }]);
    await test("key:", [{ name: "value" }]);
  });

  it("caches results", async () => {
    let getKeysCalled = 0;
    const getKeys = async () => {
      getKeysCalled += 1;
      return [{ name: "key" }];
    };
    let getValuesCalled = 0;
    const getValues = async () => {
      getValuesCalled += 1;
      return [{ name: "value" }];
    };
    const test = kvSuggestionsTest(
      keyValue({
        keys: getKeys,
        values: getValues,
        cache: true,
      })
    );
    expect(getKeysCalled).to.be.equal(0);
    expect(getValuesCalled).to.be.equal(0);

    await test("", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);
  });
});

describe("Test keyValueList suggestions", () => {
  it("has the correct query term", () => {
    const test = kvQueryTermTest(keyValueList({}));
    test("", "");
    test("key", "key");
    test("key=", "");
    test("key=val", "val");

    test(",abc", "abc");
    test("key,abc", "abc");
    test("key=,abc", "abc");
    test("key=val,abc", "abc");
    test("key=val,abc", "abc");
  });

  it("triggers correctly", () => {
    const test = kvTriggerTest(keyValueList({}));
    test("", "", false);
    test("key", "ke", false);
    test("key", "key=", true);
    test("key=", "key", true);
    test("key=va", "key=val", false);
    test("key=val", "key=val,", true);
    test("key=val,", "key=val", true);
  });

  it("suggests keys and values correctly", async () => {
    const test = kvSuggestionsTest(
      keyValueList({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: "=",
        delimiter: ",",
      })
    );
    await test("", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("=", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key=", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key=val", [{ name: "1" }, { name: "2" }, { name: "3" }]);

    await test(",", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key,", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key=value,", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key=,", [{ name: "a" }, { name: "b" }, { name: "c" }]);

    await test("key=value,key2=", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key=value,=", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("runs functions", async () => {
    const test = kvSuggestionsTest(
      keyValueList({
        keys: () => Promise.resolve([{ name: "key" }]),
        values: () => Promise.resolve([{ name: "value" }]),
        separator: ":",
      })
    );
    await test("", [{ name: "key" }]);
    await test("key", [{ name: "key" }]);
    await test(":", [{ name: "value" }]);
    await test("key:", [{ name: "value" }]);
  });

  it("caches results", async () => {
    let getKeysCalled = 0;
    const getKeys = async () => {
      getKeysCalled += 1;
      return [{ name: "key" }];
    };
    let getValuesCalled = 0;
    const getValues = async () => {
      getValuesCalled += 1;
      return [{ name: "value" }];
    };
    const test = kvSuggestionsTest(
      keyValueList({
        keys: getKeys,
        values: getValues,
        cache: true,
      })
    );
    expect(getKeysCalled).to.be.equal(0);
    expect(getValuesCalled).to.be.equal(0);

    await test("", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(1);
  });
});
