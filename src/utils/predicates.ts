export const notNullish = <T>(i: T): i is NonNullable<T> => i != null;
export const notUndefined = (i: unknown) => i !== undefined;

export const negate = (val: unknown) => !val;
