import { expect } from "chai";
import { filepaths, FilepathsOptions } from "..";

function changedFilepaths(
  input: Fig.TemplateSuggestion[],
  options: FilepathsOptions
): Fig.Suggestion[] {
  const generator = filepaths(options);
  if (generator.filterTemplateSuggestions) {
    return generator.filterTemplateSuggestions(input);
  }
  return [];
}

function templateSuggestion(name: string, type: Fig.SuggestionType): Fig.TemplateSuggestion {
  return { name, type, context: { templateType: "filepaths" } };
}

describe("Test filepaths generator sugar", () => {
  describe("It should work correctly with 'extensions'", () => {
    it("It should suggest files containing a single-dotted extension", () => {
      const options: FilepathsOptions = {
        extensions: ["js", "mjs"],
      };
      const passing: Fig.TemplateSuggestion[] = [
        templateSuggestion("file1.test.js", "file"),
        templateSuggestion("file2.js", "file"),
        templateSuggestion("file3.mjs", "file"),
        templateSuggestion("folder1.txt/", "folder"),
        templateSuggestion("folder2.txt/", "folder"),
        templateSuggestion("folder3/", "folder"),
      ];
      const failing: Fig.TemplateSuggestion[] = [templateSuggestion("file4.ts", "file")];
      expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
    });

    it("It should suggest files containing extensions with multiple dots", () => {
      const options: FilepathsOptions = {
        extensions: ["test.js", "test.ts"],
      };
      const passing: Fig.TemplateSuggestion[] = [
        templateSuggestion("file1.test.js", "file"),
        templateSuggestion("file.detail.test.js", "file"),
        templateSuggestion("file2.test.ts", "file"),
        templateSuggestion("folder1.txt/", "folder"),
        templateSuggestion("folder2.txt/", "folder"),
        templateSuggestion("folder3/", "folder"),
      ];
      const failing: Fig.TemplateSuggestion[] = [
        templateSuggestion("file.js", "file"),
        templateSuggestion("file3.test.mjs", "file"),
        templateSuggestion("file4.test.mts", "file"),
      ];
      expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
    });
  });

  describe("It should work correctly with 'suggestFolders'", () => {
    it("It should suggest folders when suggestFolders is unset ('always')", () => {
      const options: FilepathsOptions = {};
      const passing: Fig.TemplateSuggestion[] = [
        templateSuggestion("folder1.txt/", "folder"),
        templateSuggestion("folder2.txt/", "folder"),
        templateSuggestion("folder3/", "folder"),
      ];
      const failing: Fig.TemplateSuggestion[] = [
        templateSuggestion("file1.test.js", "file"),
        templateSuggestion("file2.js", "file"),
        templateSuggestion("file3.mjs", "file"),
        templateSuggestion("file4.ts", "file"),
      ];
      expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
    });
    it("It should not suggest folders when suggestFolders is 'never'", () => {
      const options: FilepathsOptions = {
        suggestFolders: "never",
      };
      const passing: Fig.TemplateSuggestion[] = [];
      const failing: Fig.TemplateSuggestion[] = [
        templateSuggestion("file1.test.js", "file"),
        templateSuggestion("file2.js", "file"),
        templateSuggestion("file3.mjs", "file"),
        templateSuggestion("file4.ts", "file"),
        templateSuggestion("folder1.txt/", "folder"),
        templateSuggestion("folder2.txt/", "folder"),
        templateSuggestion("folder3/", "folder"),
      ];
      expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
    });

    it("It should filter folders as if they were custom files when suggestFolders is 'filter'", () => {
      const options: FilepathsOptions = {
        suggestFolders: "filter",
        equals: ["package.json", "a-folder/"],
        matches: /foo/g,
      };
      const passing: Fig.TemplateSuggestion[] = [
        templateSuggestion("foo.js", "file"),
        templateSuggestion("package.json", "file"),
        templateSuggestion("a-folder/", "folder"),
        templateSuggestion("foo/", "folder"),
      ];
      const failing: Fig.TemplateSuggestion[] = [
        templateSuggestion("bar.js", "file"),
        templateSuggestion("a-folder.js", "file"),
        templateSuggestion("some-other-folder/", "folder"),
      ];
      expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
    });
  });

  it("It should work correctly with 'matches'", () => {
    const options: FilepathsOptions = {
      matches: /(file){1,2}\..*/g,
    };
    const passing: Fig.TemplateSuggestion[] = [
      templateSuggestion("filefile.js", "file"),
      templateSuggestion("file.mjs", "file"),
      templateSuggestion("filefile.txt/", "folder"),
      templateSuggestion("file1/", "folder"),
    ];
    const failing: Fig.TemplateSuggestion[] = [templateSuggestion("file1.js", "file")];
    expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
  });

  it("It should work correctly with 'equals'", () => {
    const options: FilepathsOptions = {
      equals: ["foo.js", "bar.ts"],
    };
    const passing: Fig.TemplateSuggestion[] = [
      templateSuggestion("foo.js", "file"),
      templateSuggestion("bar.ts", "file"),
      templateSuggestion("foo.js/", "folder"),
      templateSuggestion("bar.ts/", "folder"),
      templateSuggestion("foo.ts/", "folder"),
      templateSuggestion("folder/", "folder"),
    ];
    const failing: Fig.TemplateSuggestion[] = [
      templateSuggestion("foo.ts", "file"),
      templateSuggestion("foo.js.ts", "file"),
    ];
    expect(changedFilepaths(passing.concat(failing), options)).to.deep.equal(passing);
  });
});
