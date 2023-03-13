export const split =
  <T>(predicate: (item: T, index: number) => boolean) =>
  (acc: T[][], val: T, currIndex: number) => {
    if (
      !Array.isArray(acc) ||
      acc.length !== 2 ||
      !Array.isArray(acc[0]) ||
      !Array.isArray(acc[1])
    ) {
      throw new RangeError('Accumulator initial value must be [[], []]');
    }
    const res = predicate(val, currIndex);
    if (res) {
      acc[0].push(val);
    } else {
      acc[1].push(val);
    }
    return acc;
  };
