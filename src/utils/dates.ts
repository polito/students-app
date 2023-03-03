export const formatDateTime = (date: Date) => {
  return `${date?.toLocaleDateString()} ${date
    .toLocaleTimeString()
    .slice(0, -3)}`;
};

export const formatDate = (date: Date) => {
  console.debug('date', date);
  return date.toLocaleDateString();
};
