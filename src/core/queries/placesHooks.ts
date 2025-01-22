import { useMemo } from 'react';

import { GetPlacesRequest, PlacesApi } from '@polito/api-client';
import {
  GetBuildingsRequest,
  GetFreeRoomsRequest,
} from '@polito/api-client/apis/PlacesApi';
import { useQueries, useQuery } from '@tanstack/react-query';

import { noop } from 'lodash';

import { pluckData } from '../../utils/queries';

export const SITES_QUERY_KEY = 'sites';
export const BUILDINGS_QUERY_KEY = 'buildings';
export const PLACES_QUERY_KEY = 'places';
export const PLACE_QUERY_KEY = 'place';
export const PLACE_CATEGORIES_QUERY_KEY = 'place-categories';
export const FREE_ROOMS_QUERY_KEY = 'free-rooms';

const usePlacesClient = (): PlacesApi => {
  return new PlacesApi();
};

export const useGetSites = () => {
  const placesClient = usePlacesClient();

  return useQuery([SITES_QUERY_KEY], () => placesClient.getSites(), {
    staleTime: Infinity,
  });
};

export const useGetBuildings = (
  params: Omit<GetBuildingsRequest, 'siteId'> &
    Pick<Partial<GetBuildingsRequest>, 'siteId'>,
) => {
  const placesClient = usePlacesClient();

  return useQuery(
    [BUILDINGS_QUERY_KEY, JSON.stringify(params)],
    () => placesClient.getBuildings(params as GetBuildingsRequest),
    {
      staleTime: Infinity,
      enabled: params.siteId != null,
    },
  );
};

export const useGetBuilding = (siteId: string, buildingId?: string) => {
  const { data: buildings, ...rest } = useGetBuildings({ siteId });
  return useMemo(
    () => ({
      ...rest,
      data:
        buildingId == null || !buildings?.data?.length
          ? null
          : buildings.data.find(s => s.id === buildingId),
    }),
    [buildingId, buildings?.data, rest],
  );
};

export const useGetSite = (siteId?: string) => {
  const { data: sites } = useGetSites();
  return useMemo(() => {
    if (siteId == null || !sites?.data?.length) {
      return null;
    }
    return sites.data.find(s => s.id === siteId);
  }, [siteId, sites?.data]);
};

export const useGetPlaces = (params: GetPlacesRequest) => {
  const placesClient = usePlacesClient();
  if (!params.search) {
    delete params.search;
  }
  const key = [PLACES_QUERY_KEY, JSON.stringify(params)];

  return useQuery(key, () => placesClient.getPlaces(params), {
    enabled: params.siteId != null,
    staleTime: Infinity,
  });
};

export const useGetFreeRooms = (params: Partial<GetFreeRoomsRequest>) => {
  const placesClient = usePlacesClient();
  const key = [
    FREE_ROOMS_QUERY_KEY,
    params.siteId,
    params.date,
    params.timeFrom,
    params.timeTo,
  ];

  return useQuery(
    key,
    () => placesClient.getFreeRooms(params as GetFreeRoomsRequest),
    {
      enabled: params.siteId != null,
      staleTime: Infinity,
    },
  );
};

export const useGetPlaceCategories = () => {
  const placesClient = usePlacesClient();

  return useQuery(
    [PLACE_CATEGORIES_QUERY_KEY],
    () => placesClient.getPlaceCategories(),
    {
      staleTime: Infinity,
    },
  );
};

export const useGetPlaceCategory = (categoryId?: string) => {
  const { data: categories } = useGetPlaceCategories();
  return useMemo(() => {
    if (categoryId == null || !categories?.data?.length) {
      return null;
    }
    return categories.data.find(c => c.id === categoryId);
  }, [categoryId, categories?.data]);
};

export const useGetPlaceSubCategory = (subCategoryId?: string) => {
  const { data: categories } = useGetPlaceCategories();
  return useMemo(() => {
    if (subCategoryId == null || !categories?.data?.length) {
      return null;
    }
    return categories.data
      .flatMap(c => c.subCategories ?? [])
      .find(sc => sc.id === subCategoryId);
  }, [subCategoryId, categories?.data]);
};

export const useGetPlace = (placeId?: string) => {
  const placesClient = usePlacesClient();

  return useQuery(
    [PLACE_QUERY_KEY, placeId],
    () => placesClient.getPlace({ placeId: placeId! }).then(pluckData),
    {
      enabled: placeId != null,
      staleTime: Infinity,
      onError: noop,
    },
  );
};

export const useGetMultiplePlaces = (placeIds?: string[]) => {
  const placesClient = usePlacesClient();

  return useQueries({
    queries:
      placeIds?.map(placeId => ({
        queryKey: [PLACE_QUERY_KEY, placeId],
        queryFn: () => placesClient.getPlace({ placeId }).then(pluckData),
        enabled: placeId != null,
        staleTime: Infinity,
        onError: noop,
      })) ?? [],
  });
};
