import { useMemo } from 'react';

import {
  GetBuildingsRequest,
  GetFreeRoomsRequest,
  GetPlacesRequest,
  PlacesApi,
} from '@polito/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const SITES_QUERY_KEY = 'sites';
export const BUILDINGS_QUERY_KEY = 'buildings';
export const PLACES_QUERY_KEY = 'places';
export const PLACE_QUERY_KEY = 'place';
export const PLACE_CATEGORIES_QUERY_KEY = 'place-categories';
export const FREE_ROOMS_QUERY_KEY = 'free-rooms';
export const PATH_QUERY_KEY = 'path';

const usePlacesClient = (): PlacesApi => {
  return new PlacesApi();
};

export const useGetSites = () => {
  const placesClient = usePlacesClient();

  return useQuery({
    queryKey: [SITES_QUERY_KEY],
    queryFn: () => placesClient.getSites(),
    staleTime: Infinity,
  });
};

export const useGetBuildings = (
  params: Omit<GetBuildingsRequest, 'siteId'> &
    Pick<Partial<GetBuildingsRequest>, 'siteId'>,
) => {
  const placesClient = usePlacesClient();

  return useQuery({
    queryKey: [BUILDINGS_QUERY_KEY, JSON.stringify(params)],
    queryFn: () => placesClient.getBuildings(params as GetBuildingsRequest),
    staleTime: Infinity,
    enabled: params.siteId != null,
  });
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
  const key = [PLACES_QUERY_KEY, JSON.stringify(params)];

  return useQuery({
    queryKey: key,
    queryFn: () => placesClient.getPlaces(params),
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

  return useQuery({
    queryKey: key,
    queryFn: () => placesClient.getFreeRooms(params as GetFreeRoomsRequest),
    enabled: params.siteId != null,
    staleTime: Infinity,
  });
};

export const useGetPlaceCategories = () => {
  const placesClient = usePlacesClient();

  return useQuery({
    queryKey: [PLACE_CATEGORIES_QUERY_KEY],
    queryFn: () => placesClient.getPlaceCategories(),
    staleTime: Infinity,
  });
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

  return useQuery({
    queryKey: [PLACE_QUERY_KEY, placeId],
    queryFn: () => placesClient.getPlace({ placeId: placeId! }).then(pluckData),
    enabled: placeId != null,
    staleTime: Infinity,
  });
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
      })) ?? [],
  });
};

export const useGetPath = (params: {
  startPlaceId?: string;
  destPlaceId?: string;
  avoidStairs?: boolean;
  computeButtonState: number;
  generateFeedback: () => void;
}) => {
  const placesClient = usePlacesClient();

  return useQuery({
    queryKey: [
      PATH_QUERY_KEY,
      params.startPlaceId,
      params.destPlaceId,
      params.avoidStairs,
    ],
    queryFn: () =>
      placesClient
        .getDirections({
          startPlaceId: params.startPlaceId!,
          destinationPlaceId: params.destPlaceId!,
          avoidStairs: params.avoidStairs,
        })
        .catch(error => {
          // Custom handling for 404 errors to return a more descriptive message
          if (error.response?.status === 404) {
            params.generateFeedback();

            return null;
          }
          throw error;
        }),
    enabled: !!(
      params.startPlaceId &&
      params.destPlaceId &&
      params.computeButtonState === 1
    ),
    staleTime: Infinity,
  });
};
