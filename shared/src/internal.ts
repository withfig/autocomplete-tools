type Override<T, S> = Omit<T, keyof S> & S;

// eslint-disable-next-line @typescript-eslint/ban-types
type FigLoadSpecFn = Fig.LoadSpec extends infer U ? (U extends Function ? U : never) : never;
export type LoadSpec<ArgT = ArgMeta, OptionT = OptionMeta, SubcommandT = SubcommandMeta> =
  | Fig.SpecLocation[]
  | Subcommand<ArgT, OptionT, SubcommandT>
  | ((
      ...args: Parameters<FigLoadSpecFn>
    ) => Promise<Fig.SpecLocation[] | Subcommand<ArgT, OptionT, SubcommandT>>);

export type SuggestionType = Fig.SuggestionType | "history" | "auto-execute";
export type ArgMeta = Omit<Fig.Arg, "template" | "generators" | "loadSpec"> & {
  generators: Fig.Generator[];
};

export type Arg<ArgT = ArgMeta, OptionT = OptionMeta, SubcommandT = SubcommandMeta> = ArgT & {
  loadSpec?: LoadSpec<ArgT, OptionT, SubcommandT>;
};

export type Suggestion = Override<Fig.Suggestion, { type?: SuggestionType }>;

export type OptionMeta = Omit<Fig.Option, "args" | "name">;
export type Option<ArgT = ArgMeta, OptionT = OptionMeta, SubcommandT = SubcommandMeta> = OptionT & {
  name: string[];
  args: Arg<ArgT, OptionT, SubcommandT>[];
};

type SubcommandMetaExcludes =
  | "subcommands"
  | "options"
  | "loadSpec"
  | "persistentOptions"
  | "args"
  | "name"
  | "parserDirectives";

export type SubcommandMeta = Omit<Fig.Subcommand, SubcommandMetaExcludes> & {
  parserDirectives: Fig.Subcommand["parserDirectives"];
};
export type Subcommand<
  ArgT = ArgMeta,
  OptionT = OptionMeta,
  SubcommandT = SubcommandMeta
> = SubcommandT & {
  name: string[];
  subcommands: Record<string, Subcommand<ArgT, OptionT, SubcommandT>>;
  options: Record<string, Option<ArgT, OptionT, SubcommandT>>;
  persistentOptions: Record<string, Option<ArgT, OptionT, SubcommandT>>;
  loadSpec?: LoadSpec<ArgT, OptionT, SubcommandT>;
  args: Arg<ArgT, OptionT, SubcommandT>[];
};

export type Spec = Subcommand;
