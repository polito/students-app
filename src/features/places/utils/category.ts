export const formatPlaceCategory = (name: string) =>
  name.split(' - ')[1] ?? name;
