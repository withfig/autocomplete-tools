import semver from "semver";

const isPrimitive = (obj: unknown): boolean => obj !== Object(obj);

const deepEqual = <T>(a: T, b: T): boolean => {
  if (a === b) return true;
  if (isPrimitive(a) && isPrimitive(b)) return a === b;
  if (Object.keys(a as "object").length !== Object.keys(b as "object").length) return false;
  for (const key in a) {
    if (!(typeof b === "object" && b && key in b && deepEqual(a[key], b[key]))) {
      return false;
    }
  }
  return true;
};

const diffSimpleObject = <T>(original: T, updated: T): T => {
  const diff = { ...updated };
  for (const key in diff) {
    if (
      original &&
      typeof original === "object" &&
      key in original &&
      deepEqual(original[key], updated[key])
    ) {
      delete diff[key];
    }
  }
  return diff;
};
const mergeSimpleObject = <T>(original: T, diff: Diff<T>): T => ({
  ...original,
  ...diff,
});

const toArray = <T>(x: T | T[] | undefined | null): T[] => {
  if (!x) {
    return [];
  }
  return Array.isArray(x) ? x : [x];
};

const namesMatch = (x: NamedObject, y: NamedObject): boolean => {
  const xNames = new Set(toArray(x.name));
  return toArray(y.name).some((name) => xNames.has(name));
};
const isEmpty = <T>(x: T): boolean => x === undefined || x === null || Object.keys(x).length === 0;

type NamedObject = {
  name: string | string[];
};
type Remove = NamedObject & { remove: true };

const diffNamedArrays = <TDiff extends NamedObject, T extends TDiff>(
  previous: T[],
  updated: T[],
  diffFn: (p: T, u: T) => TDiff | null
) => {
  const diffs: Array<TDiff | Remove> = [];
  const matchedIndexes: Set<number> = new Set();
  updated.forEach((curr) => {
    const idx = previous.findIndex((prev, i) => !matchedIndexes.has(i) && namesMatch(curr, prev));
    if (idx === -1) {
      diffs.push(curr);
    } else {
      matchedIndexes.add(idx);
      const diff = diffFn(previous[idx], curr);
      if (diff !== null && Object.keys(diff).length > 0) {
        diffs.push(diff);
      }
    }
  });
  previous.forEach((prev, i) => {
    if (!matchedIndexes.has(i)) {
      diffs.push({ name: prev.name, remove: true });
    }
  });
  return diffs;
};

const mergeNamedArrayDiff = <TDiff extends NamedObject, T extends TDiff>(
  current: T[],
  diffs: (TDiff | Remove)[],
  mergeFn: (current: T, diff: TDiff) => T | null
) => {
  const updated: T[] = [];
  const mergedIndexes: Set<number> = new Set();
  diffs.forEach((diff) => {
    const idx = current.findIndex((curr, i) => !mergedIndexes.has(i) && namesMatch(curr, diff));
    if (idx === -1) {
      updated.push(diff as T);
    } else {
      mergedIndexes.add(idx);
      if (!("remove" in diff)) {
        const merged = mergeFn(current[idx], diff);
        if (merged !== null) {
          updated.push(merged);
        }
      }
    }
  });
  current.forEach((curr, i) => {
    if (!mergedIndexes.has(i)) {
      updated.push(curr);
    }
  });
  return updated;
};

const diffOrderedArrays = <TDiff, T>(
  previous: T[],
  updated: T[],
  diffFn: (p: T, u: T) => TDiff
) => {
  const diffs: (TDiff | { remove: true })[] = [];
  updated.forEach((curr, idx) => {
    const diff = diffFn(previous[idx], curr);
    diffs.push(diff);
  });
  for (let i = diffs.length; i < previous.length; i += 1) {
    diffs.push({ remove: true });
  }
  return diffs.every((diff) => isEmpty(diff)) ? [] : diffs;
};

const mergeOrderedArrays = <TDiff, T extends TDiff>(
  current: T[],
  diffs: (TDiff | { remove: true })[],
  mergeFn: (current: T, diff: TDiff) => T | null
) =>
  diffs
    .filter(
      (diff): diff is TDiff =>
        !(typeof diff === "object" && diff && "remove" in diff) || !diff.remove
    )
    .map((diff, idx) => mergeFn(current[idx], diff))
    .filter((merged): merged is T => merged !== null);

type Diff<T> = {
  [key in keyof T]?: unknown;
};

type Processor<TDiff, T> = {
  diff: (t1: T, t2: T) => TDiff | null;
  merge: (t: T, tdiff: TDiff | null) => T;
};

type ProcessorMapping<T, U> = {
  [key in keyof T & keyof U]?: Processor<U[key], T[key]>;
};

type IsDiff<U, T extends U> = U extends Diff<T> ? U : never;
const makeNamedProcessor = <TDiff extends NamedObject, T extends TDiff>(
  propertyMapping: ProcessorMapping<T, TDiff>
): Processor<IsDiff<TDiff, T>, T> => ({
  diff: (previous, updated) => {
    const diff = { ...updated } as TDiff extends Diff<T> ? TDiff : never;
    for (const key in diff) {
      if (key !== "name") {
        if (key in propertyMapping) {
          delete diff[key];
        } else if (key in previous && deepEqual(previous[key], updated[key])) {
          delete diff[key];
        }
      }
    }
    // eslint-disable-next-line guard-for-in
    for (const mapKey in propertyMapping) {
      // TODO: For some reason typescript can't infer the type well here...
      const key = mapKey as keyof typeof propertyMapping;
      const propDiff =
        previous[key] && updated[key]
          ? propertyMapping[key]?.diff(previous[key], updated[key])
          : updated[key];
      if (propDiff && !isEmpty(propDiff)) {
        diff[key] = propDiff;
      }
    }
    return Object.keys(diff).length === 1 ? null : diff;
  },
  merge: (current, diff) => {
    if (diff === null) {
      return current;
    }
    const merged = { ...current, ...diff };
    // eslint-disable-next-line guard-for-in
    for (const mapKey in propertyMapping) {
      // TODO: For some reason typescript can't infer the type well here...
      const key = mapKey as keyof typeof propertyMapping;
      const property = propertyMapping[key];
      if (diff[key] && property !== undefined) {
        merged[key] = property.merge(current[key], diff[key]);
      }
    }
    return merged;
  },
});

const argArrayProcessor: Processor<
  Fig.ArgDiff | Fig.ArgDiff[] | undefined,
  Fig.Arg | Fig.Arg[] | undefined
> = {
  diff: (p, u) => diffOrderedArrays(toArray(p), toArray(u), diffSimpleObject),
  merge: (c, d) => mergeOrderedArrays(toArray(c), toArray(d), mergeSimpleObject),
};

const optionProcessor = makeNamedProcessor<Fig.OptionDiff, Fig.Option>({
  args: argArrayProcessor,
});

const subcommandProcessor: Processor<Fig.SubcommandDiff, Fig.Subcommand> = makeNamedProcessor({
  subcommands: {
    diff: (p, u) => diffNamedArrays(toArray(p), toArray(u), subcommandProcessor.diff),
    merge: (c, d) => mergeNamedArrayDiff(toArray(c), toArray(d), subcommandProcessor.merge),
  },
  options: {
    diff: (p, u) => diffNamedArrays(toArray(p), toArray(u), optionProcessor.diff),
    merge: (c, d) => mergeNamedArrayDiff(toArray(c), toArray(d), optionProcessor.merge),
  },
  args: argArrayProcessor,
} as const);

const getBestVersionIndex = (versions: string[], target?: string): number => {
  if (!target) return versions.length - 1;
  // find the last element minor or equal to the target
  for (let i = versions.length - 1; i >= 0; i -= 1) {
    const version = versions[i];
    if (semver.compare(version, target) <= 0) {
      return i;
    }
  }
  return versions.length - 1;
};

export const applySpecDiff = (spec: Fig.Subcommand, diff: Fig.SpecDiff): Fig.Subcommand =>
  subcommandProcessor.merge(spec, { ...diff, name: spec.name });

export const diffSpecs = (original: Fig.Subcommand, updated: Fig.Subcommand): Fig.SpecDiff => {
  const result = subcommandProcessor.diff(original, updated);
  if (result === null) {
    return {};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name: _name, remove: _remove, ...remaining } = result;
  return remaining;
};

export const getVersionFromVersionedSpec = (
  base: Fig.Subcommand,
  versions: Fig.VersionDiffMap,
  target?: string
): { version: string; spec: Fig.Subcommand } => {
  const versionNames = Object.keys(versions).sort(semver.compare);
  const versionIndex = getBestVersionIndex(versionNames, target);
  const spec = versionNames
    .slice(0, versionIndex + 1)
    .map((name) => versions[name])
    .reduce(applySpecDiff, base);
  return { spec, version: versionNames[versionIndex] };
};

export const createVersionedSpec =
  (specName: string, versionFiles: string[]): Fig.Spec =>
  async (version?: string) => {
    const versionNames = versionFiles.sort(semver.compare);
    const versionFileIndex = getBestVersionIndex(versionNames, version);
    const versionFile = versionNames[versionFileIndex];
    return {
      versionedSpecPath: `${specName}/${versionFile}`,
      version,
    };
  };
