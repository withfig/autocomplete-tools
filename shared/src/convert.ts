import { Option, Subcommand, Arg, LoadSpec } from "./internal";
import { makeArray, SpecLocationSource } from "./utils";

const makeNamedMap = <T extends { name: string[] }>(items: T[] | undefined): Record<string, T> => {
  const nameMapping: Record<string, T> = {};
  if (!items) {
    return nameMapping;
  }

  for (let i = 0; i < items.length; i += 1) {
    items[i].name.forEach((name) => {
      nameMapping[name] = items[i];
    });
  }
  return nameMapping;
};

function convertLoadSpec(
  loadSpec: Fig.LoadSpec,
  parserDirectives?: Fig.Subcommand["parserDirectives"]
): LoadSpec {
  if (typeof loadSpec === "string") {
    return [{ name: loadSpec, type: SpecLocationSource.GLOBAL }];
  }

  if (typeof loadSpec === "function") {
    return (...args) =>
      loadSpec(...args).then((result) => {
        if (Array.isArray(result)) {
          return result;
        }
        if ("type" in result) {
          return [result];
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return convertSubcommand(result, parserDirectives);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return convertSubcommand(loadSpec, parserDirectives);
}

function convertArg(arg: Fig.Arg, parserDirectives?: Fig.Subcommand["parserDirectives"]): Arg {
  const { template, ...rest } = arg;
  const generators = template ? [{ template }] : makeArray(arg.generators ?? []);
  return {
    ...rest,
    loadSpec: arg.loadSpec ? convertLoadSpec(arg.loadSpec, parserDirectives) : undefined,
    generators: generators.map((generator) => {
      let { trigger, getQueryTerm } = generator;
      if (generator.template) {
        const templates = makeArray(generator.template);
        if (templates.includes("folders") || templates.includes("filepaths")) {
          trigger = trigger ?? "/";
          getQueryTerm = getQueryTerm ?? "/";
        }
      }
      return { ...generator, trigger, getQueryTerm };
    }),
  };
}

function convertOption(
  option: Fig.Option,
  parserDirectives?: Fig.Subcommand["parserDirectives"]
): Option {
  return {
    ...option,
    name: makeArray(option.name),
    args: option.args ? makeArray(option.args).map((arg) => convertArg(arg, parserDirectives)) : [],
  };
}

export function convertSubcommand(
  subcommand: Fig.Subcommand,
  parserDirectives?: Fig.Subcommand["parserDirectives"]
): Subcommand {
  const { subcommands, options, args, loadSpec } = subcommand;
  const directives = subcommand.parserDirectives ?? parserDirectives;
  return {
    ...subcommand,
    parserDirectives: directives,
    loadSpec: loadSpec ? convertLoadSpec(loadSpec, directives) : undefined,
    name: makeArray(subcommand.name),
    subcommands: makeNamedMap<Subcommand>(
      subcommands?.map((s) => convertSubcommand(s, directives))
    ),
    options: makeNamedMap<Option>(
      options
        ?.filter((option) => !option.isPersistent)
        ?.map((option) => convertOption(option, directives))
    ),
    persistentOptions: makeNamedMap<Option>(
      options
        ?.filter((option) => option.isPersistent)
        ?.map((option) => convertOption(option, directives))
    ),
    args: args ? makeArray(args).map((arg) => convertArg(arg, directives)) : [],
  };
}
