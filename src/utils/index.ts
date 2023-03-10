export const truncate = (str: string = '', length: number = Infinity) => {
  if (str.length > length) {
    return str.slice(0, length) + '...';
  } else return str;
};
