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

export const useNavigationPlaces = ({
    siteId,
    search,
    floorId
}: UseSearchPlacesOptions) => {
    const { data: places, isLoading } = useSearchPlaces({
        siteId,
        search,
        floorId, //perchè se no mi esclude tutti i posti di XPTE
    });

    const filteredPlaces = useMemo(() => 
         places.filter(p => !excludedNavigationPOICategories.includes(p.category?.id)),
    [places]);

    return {
        filteredPlaces,
        isLoading
    }
  
}