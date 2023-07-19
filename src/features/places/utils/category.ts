export const formatPlaceCategory = (name?: string) =>
  name?.length ? name.split(' - ')[1] ?? name : undefined;
