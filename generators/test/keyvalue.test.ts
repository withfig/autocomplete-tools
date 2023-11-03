import { expect } from "chai";
import { keyValue, keyValueList, valueList } from "../lib";

function testSuggestions(
  generator: Fig.Generator
): (token: string, expected: Fig.Suggestion[]) => Promise<void> {
  return async (token, expected) => {
    const result = await generator.custom?.(
      ["spec", token],
      () =>
        Promise.resolve({
          status: 1,
          stderr: "",
          stdout: "",
        }),
      {
        searchTerm: "",
        currentProcess: "",
        currentWorkingDirectory: "",
        sshPrefix: "",
        environmentVariables: {},
      }
    );
    expect(result).to.deep.equal(expected);
  };
}

export function testQueryTerm(gen: Fig.Generator): (token: string, expected: string) => void {
  const { getQueryTerm } = gen;
  expect(getQueryTerm).to.be.a("function");
  // @ts-ignore
  return (token, expected) => expect(getQueryTerm(token)).to.equal(expected);
}

function triggerMsg(newToken: string, oldToken: string, expected: boolean) {
  if (expected) {
    return `Expected '${newToken}' -> '${oldToken}' to trigger, but it didn't`;
  }
  return `Didn't expect '${newToken}' -> '${oldToken}' to trigger, but it did`;
}

export function testTrigger(
  gen: Fig.Generator
): (newToken: string, oldToken: string, expected: boolean) => void {
  const { trigger } = gen;
  expect(trigger).to.be.a("function");
  return (newToken, oldToken, expected) =>
    // @ts-ignore
    expect(trigger(newToken, oldToken)).to.equal(
      expected,
      triggerMsg(newToken, oldToken, expected)
    );
}

describe("Test valueList suggestions", () => {
  it("has the correct query term", () => {
    const test = testQueryTerm(valueList({}));
    test("", "");
    test("value", "value");
    test("value,", "");
    test("value,val", "val");
  });

  it("triggers correctly", () => {
    const test = testTrigger(valueList({}));
    test("", "", false);
    test("", "a", false);
    test("value", "value,", true);
    test("value,", "value", true);
    test("value,", "value,v", false);
    test("value,v", "value,val", false);
  });

  it("suggests values correctly", async () => {
    const test = testSuggestions(
      valueList({
        values: ["1", "2", "3"],
        delimiter: "/",
        insertDelimiter: false,
        allowRepeatedValues: true,
      })
    );
    await test("", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("1", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("1/", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("can append the delimiter to values", async () => {
    const test = testSuggestions(
      valueList({
        values: ["1", "2", "3"],
        delimiter: "/",
        insertDelimiter: true,
      })
    );
    await test("", [
      { name: "1", insertValue: "1/" },
      { name: "2", insertValue: "2/" },
      { name: "3", insertValue: "3/" },
    ]);
  });

  it("runs functions", async () => {
    const test = testSuggestions(
      valueList({
        values: () => Promise.resolve([{ name: "value" }]),
      })
    );
    await test("", [{ name: "value" }]);
  });

  it("caches results", async () => {
    let getValuesCalled = 0;
    const getValues = async () => {
      getValuesCalled += 1;
      return [{ name: "value" }];
    };
    const test = testSuggestions(
      valueList({
        values: getValues,
        allowRepeatedValues: true,
        cache: true,
      })
    );
    expect(getValuesCalled).to.be.equal(0);

    await test("", [{ name: "value" }]);
    expect(getValuesCalled).to.be.equal(1);

    await test("value", [{ name: "value" }]);
    expect(getValuesCalled).to.be.equal(1);

    await test("value,", [{ name: "value" }]);
    expect(getValuesCalled).to.be.equal(1);

    await test("value,value,", [{ name: "value" }]);
    expect(getValuesCalled).to.be.equal(1);
  });

  it("removes used values by default", async () => {
    const test = testSuggestions(
      valueList({
        values: ["1", "2", "3"],
      })
    );
    await test("", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("1,", [{ name: "2" }, { name: "3" }]);
    await test("1,2", [{ name: "3" }]);
  });

  it("can be configured to allow repeated values", async () => {
    const test = testSuggestions(
      valueList({
        values: ["1", "2", "3"],
        allowRepeatedValues: true,
      })
    );
    await test("1,", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });
});

describe("Test keyValue suggestions", () => {
  it("has the correct query term", () => {
    const test = testQueryTerm(keyValue({}));
    test("", "");
    test("key", "key");
    test("key=", "");
    test("key=val", "val");
  });

  it("triggers correctly", () => {
    const test = testTrigger(keyValue({}));
    test("", "", false);
    test("", "a", false);
    test("key", "key=", true);
    test("key=", "key", true);
    test("key=", "key=v", false);
    test("key=val", "key=val=", false);
  });

  it("suggests keys and values correctly", async () => {
    const test = testSuggestions(
      keyValue({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: ":",
        insertSeparator: false,
      })
    );
    await test("", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test("key", [{ name: "a" }, { name: "b" }, { name: "c" }]);
    await test(":", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:val", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("can append the separator to keys", async () => {
    const test = testSuggestions(
      keyValue({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: ":",
        // The default behavior is to insert the separator
        // insertSeparator:false
      })
    );
    await test("", [
      { name: "a", insertValue: "a:" },
      { name: "b", insertValue: "b:" },
      { name: "c", insertValue: "c:" },
    ]);
    await test("key", [
      { name: "a", insertValue: "a:" },
      { name: "b", insertValue: "b:" },
      { name: "c", insertValue: "c:" },
    ]);
    // checking that the value suggestions don't have the separator
    await test(":", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:", [{ name: "1" }, { name: "2" }, { name: "3" }]);
    await test("key:val", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("runs functions", async () => {
    const test = testSuggestions(
      keyValue({
        keys: () => Promise.resolve([{ name: "key" }]),
        values: () => Promise.resolve([{ name: "value" }]),
        separator: ":",
        insertSeparator: false,
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
    const test = testSuggestions(
      keyValue({
        keys: getKeys,
        values: getValues,
        cache: true,
        insertSeparator: false,
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

  it("can cache keys independently", async () => {
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
    const test = testSuggestions(
      keyValue({
        keys: getKeys,
        values: getValues,
        cache: "keys",
        insertSeparator: false,
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
    expect(getValuesCalled).to.be.equal(2);

    await test("key=val=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(3);
  });

  it("can cache values independently", async () => {
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
    const test = testSuggestions(
      keyValue({
        keys: getKeys,
        values: getValues,
        cache: "values",
        insertSeparator: false,
      })
    );
    expect(getKeysCalled).to.be.equal(0);
    expect(getValuesCalled).to.be.equal(0);

    await test("", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(0);

    await test("key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(1);
  });
});

describe("Test keyValueList suggestions", () => {
  it("has the correct query term", () => {
    const test = testQueryTerm(keyValueList({}));
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
    const test = testTrigger(keyValueList({}));
    test("", "", false);
    test("key", "ke", false);
    test("key", "key=", true);
    test("key=", "key", true);
    test("key=va", "key=val", false);
    test("key=val", "key=val,", true);
    test("key=val,", "key=val", true);
  });

  it("suggests keys and values correctly", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: "=",
        delimiter: ",",
        insertSeparator: false,
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

  it("removes used keys by default, but not values", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: "=",
        delimiter: ",",
        insertSeparator: false,
      })
    );
    await test("a=1,", [{ name: "b" }, { name: "c" }]);
    await test("a=1,b=", [{ name: "1" }, { name: "2" }, { name: "3" }]);
  });

  it("can be configured to allow repeated keys", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: "=",
        delimiter: ",",
        insertSeparator: false,
        allowRepeatedKeys: true,
      })
    );
    await test("a=1,", [{ name: "a" }, { name: "b" }, { name: "c" }]);
  });

  it("can be configured to disallow repeated values", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: ["a", "b", "c"],
        values: ["1", "2", "3"],
        separator: "=",
        delimiter: ",",
        insertSeparator: false,
        allowRepeatedValues: false,
      })
    );
    await test("a=1,b=", [{ name: "2" }, { name: "3" }]);
  });

  it("can insert the separator and delimiter", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: ["a"],
        values: ["1"],
        separator: "=",
        delimiter: ",",
        insertSeparator: true,
        insertDelimiter: true,
      })
    );
    await test("", [{ name: "a", insertValue: "a=" }]);
    await test("key", [{ name: "a", insertValue: "a=" }]);
    await test("=", [{ name: "1", insertValue: "1," }]);
    await test("key=", [{ name: "1", insertValue: "1," }]);
    await test("key=val", [{ name: "1", insertValue: "1," }]);

    await test(",", [{ name: "a", insertValue: "a=" }]);
    await test("key,", [{ name: "a", insertValue: "a=" }]);
    await test("key=value,", [{ name: "a", insertValue: "a=" }]);
    await test("key=,", [{ name: "a", insertValue: "a=" }]);

    await test("key=value,key2=", [{ name: "1", insertValue: "1," }]);
    await test("key=value,=", [{ name: "1", insertValue: "1," }]);
  });

  it("runs functions", async () => {
    const test = testSuggestions(
      keyValueList({
        keys: () => Promise.resolve([{ name: "key" }]),
        values: () => Promise.resolve([{ name: "value" }]),
        separator: ":",
        insertSeparator: false,
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
    const test = testSuggestions(
      keyValueList({
        keys: getKeys,
        values: getValues,
        cache: true,
        insertSeparator: false,
        allowRepeatedKeys: true,
        allowRepeatedValues: true,
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

  it("can cache keys independently", async () => {
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

    const test = testSuggestions(
      keyValueList({
        keys: getKeys,
        values: getValues,
        cache: "keys",
        insertSeparator: false,
        allowRepeatedKeys: true,
        allowRepeatedValues: true,
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
    expect(getValuesCalled).to.be.equal(2);

    await test("key=val,", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(2);

    await test("key=val,key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(2);

    await test("key=val,key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(3);

    await test("key=val,key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(4);
  });

  it("can cache values independently", async () => {
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

    const test = testSuggestions(
      keyValueList({
        keys: getKeys,
        values: getValues,
        cache: "values",
        insertSeparator: false,
        allowRepeatedKeys: true,
        allowRepeatedValues: true,
      })
    );

    expect(getKeysCalled).to.be.equal(0);
    expect(getValuesCalled).to.be.equal(0);

    await test("", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(1);
    expect(getValuesCalled).to.be.equal(0);

    await test("key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(0);

    await test("key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(2);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(3);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key", [{ name: "key" }]);
    expect(getKeysCalled).to.be.equal(4);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key=", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(4);
    expect(getValuesCalled).to.be.equal(1);

    await test("key=val,key=val", [{ name: "value" }]);
    expect(getKeysCalled).to.be.equal(4);
    expect(getValuesCalled).to.be.equal(1);
  });
});
