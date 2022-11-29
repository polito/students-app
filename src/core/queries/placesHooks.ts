import { GetPlacesRequest, PlacesApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

export const SITES_QUERY_KEY = 'sites';
export const PLACES_QUERY_KEY = 'places';
export const PLACE_QUERY_KEY = 'place';

const usePlacesClient = (): PlacesApi => {
  const {
    clients: { places: placesClient },
  } = useApiContext();
  return placesClient;
};

export const useGetSites = () => {
  const placesClient = usePlacesClient();

  return useQuery([SITES_QUERY_KEY], () => placesClient.getSites(), {
    staleTime: Infinity,
  });
};

export const useGetPlaces = (params: GetPlacesRequest) => {
  const placesClient = usePlacesClient();
  const key = [PLACES_QUERY_KEY];
  if (params.siteId != null) {
    key.push(params.siteId);
  }
  if (params.search != null) {
    key.push(params.search);
  }

  return useQuery(key, () => placesClient.getPlaces(params));
};

export const useGetPlace = (placeId: string) => {
  const { data: places } = useGetPlaces({ search: '' });

  return useQuery(
    [PLACE_QUERY_KEY, placeId],
    () =>
      Promise.resolve({
        data: places?.data.find(place => place.name === placeId),
      }),
    {
      enabled: places != null,
      staleTime: Infinity,
    },
  );
};
