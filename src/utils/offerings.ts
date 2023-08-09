export const getNextShortYear = (year: string): string => {
  return (Number(year) + 1).toString().substring(2, 4);
};
