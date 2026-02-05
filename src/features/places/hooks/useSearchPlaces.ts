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
  departmentId?: string;
}

export const useSearchPlaces = ({
  siteId,
  search,
  floorId,
  categoryId,
  subCategoryId,
  departmentId,
}: UseSearchPlacesOptions): { data: SearchPlace[]; isLoading: boolean } => {
  const buildingsQuery = useGetBuildings({
    siteId,
    search,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
  });
  const placesQuery = useGetPlaces({
    search: search || undefined,
    siteId,
    floorId: search ? undefined : floorId,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
    departmentId,
  });
  const data = useMemo(() => {
    return [
      ...(placesQuery.data?.data ?? []),
      ...(buildingsQuery.data?.data ?? []),
    ];
  }, [buildingsQuery.data?.data, placesQuery.data?.data]);

  return {
    data,
    isLoading: buildingsQuery.isLoading || placesQuery.isLoading,
  };
};
