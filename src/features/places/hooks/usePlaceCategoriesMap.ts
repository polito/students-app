import { PlaceCategory } from '@polito/api-client/models';

import { useGetPlaceCategories } from '../../../core/queries/placesHooks';

export const usePlaceCategoriesMap = () => {
  const { data: categories } = useGetPlaceCategories();
  if (!categories) {
    return null;
  }
  return categories.data
    .concat(categories.data.flatMap(c => c.subCategories ?? []))
    .reduce<Record<PlaceCategory['id'], PlaceCategory>>((acc, val) => {
      acc[val.id] = val;
      return acc;
    }, {});
};
