import { useMemo } from 'react';

import {
  useGetBuildings,
  useGetPlaces,
} from '../../../core/queries/placesHooks';
import { SearchPlace } from '../types';

interface UseSearchPlacesOptions {
  search?: string;
  siteId?: string;
  floorId?: string;
  categoryId?: string;
  subCategoryId?: string;
}

export const useSearchPlaces = ({
  siteId,
  search,
  floorId,
  categoryId,
  subCategoryId,
}: UseSearchPlacesOptions): { data: SearchPlace[]; isLoading: boolean } => {
  const buildingsQuery = useGetBuildings(siteId);
  const placesQuery = useGetPlaces({
    search,
    siteId,
    floorId,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
  });
  const data = useMemo(() => {
    return [
      ...(placesQuery.data?.data ?? []),
      ...(buildingsQuery.data?.data.filter(b => {
        return (
          (!search || b.name.toLowerCase().includes(search.toLowerCase())) &&
          (!categoryId || b.category.id) &&
          (!subCategoryId ||
            !b.category.subCategory ||
            b.category.subCategory.id === subCategoryId)
        );
      }) ?? []),
    ];
  }, [
    buildingsQuery.data?.data,
    categoryId,
    placesQuery.data?.data,
    search,
    subCategoryId,
  ]);
  return {
    data,
    isLoading: buildingsQuery.isLoading || placesQuery.isLoading,
  };
};
