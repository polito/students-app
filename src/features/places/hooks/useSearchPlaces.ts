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

const excludedNavigationPOICategories = ['SCALA', 'ASCEN'];

interface UseNavigationPlacesOptions {
  search?: string;
  siteId?: string;
  floorId?: string;
  startRoom?: string;
  destRoom?: string;
}

export const useNavigationPlaces = ({
  siteId,
  search,
  floorId,
  startRoom,
  destRoom,
}: UseNavigationPlacesOptions) => {
  const { data: places, isLoading } = useSearchPlaces({
    siteId,
    search,
    floorId,
  });

  const filteredPlaces = useMemo(() => {
    let filtered = places.filter(
      p => !excludedNavigationPOICategories.includes(p.category?.id),
    );
    if (startRoom && destRoom) {
      filtered = filtered.filter(p => p.id !== startRoom && p.id !== destRoom);
    }
    return filtered;
  }, [places, startRoom, destRoom]);

  return {
    filteredPlaces,
    isLoading,
  };
};
