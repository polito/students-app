/* eslint-disable @typescript-eslint/naming-convention */
import { useState } from 'react';

import {
  Results,
  create,
  search as fullTextSearch,
  insertMultiple,
} from '@orama/orama';
import { useQuery } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetPlaces } from '../../../core/queries/placesHooks';
import { useGetAgendaWeeks } from '../../agenda/queries/agendaHooks';
import { AgendaItem } from '../../agenda/types/AgendaItem';
import { UPCOMING_COMMITMENT_HOURS_OFFSET } from '../constants';
import { PlaceOverviewWithMetadata } from '../types';
import { resolvePlaceId } from '../utils/resolvePlaceId';

interface UseSearchPlacesOptions {
  search?: string;
  siteId?: string;
  floorId?: string | null;
  categoryId?: string;
  subCategoryId?: string;
}

// TODO use once types work with Orama
// eslint-disable-next-line unused-imports/no-unused-vars
type PlacesDb = Awaited<ReturnType<typeof createDb>>;
// TODO should be <PlacesDb>
type FullTextQuery = Parameters<typeof fullTextSearch<any>>['1'];

const createDb = () =>
  create({
    schema: {
      id: 'string',
      latitude: 'number',
      longitude: 'number',
      site: {
        id: 'string',
        name: 'string',
      },
      building: {
        id: 'string',
        name: 'string',
        siteId: 'string',
      },
      floor: {
        id: 'string',
        name: 'string',
        level: 'number',
      },
      room: {
        id: 'string',
        name: 'string',
      },
      category: {
        id: 'string',
        name: 'string',
        subCategory: {
          id: 'string',
          name: 'string',
        },
      },
      agendaItem: {
        id: 'number',
        type: 'string',
        fromTime: 'string',
        toTime: 'string',
      },
    },
  });

const PLACES_SEARCH_DB_QUERY_KEY = 'places-search-db';

const useGetPlacesSearchDb = ({ siteId }: { siteId?: string }) => {
  const { placesSearched } = usePreferencesContext();
  const { data: places, isFetched: fetchedPlaces } = useGetPlaces({ siteId });
  const [commitmentsFrom] = useState(DateTime.now());
  const [startOfWeek] = useState(commitmentsFrom.startOf('week'));
  const { data: agendaWeeks } = useGetAgendaWeeks([startOfWeek]);

  return useQuery(
    [
      PLACES_SEARCH_DB_QUERY_KEY,
      siteId,
      startOfWeek.toISO(),
      placesSearched.map(({ id }) => id).join(),
    ],
    async () => {
      const db = await createDb();
      const commitmentsByPlaceId = agendaWeeks
        .flatMap(({ data }) => data.flatMap(({ items }) => items))
        .reduce((acc, agendaItem) => {
          if (agendaItem.type === 'lecture' && agendaItem.place != null) {
            const placeId = resolvePlaceId(agendaItem.place);
            if (
              !acc[placeId] &&
              ((agendaItem.start >= commitmentsFrom &&
                agendaItem.start.diff(commitmentsFrom).milliseconds <
                  UPCOMING_COMMITMENT_HOURS_OFFSET * 60 * 60 * 1000) ||
                (agendaItem.start <= commitmentsFrom &&
                  agendaItem.end >= commitmentsFrom))
            ) {
              acc[placeId] = agendaItem;
            }
          }
          return acc;
        }, {} as Record<string, AgendaItem>);
      const recentPlacesByPlaceId = placesSearched.reduce((acc, val, index) => {
        acc[val.id] = index;
        return acc;
      }, {} as Record<string, number>);
      await insertMultiple(
        db,
        // @ts-expect-error Orama not recognizing elements type
        places?.data?.map(place => {
          const placeWithMetadata: PlaceOverviewWithMetadata = {
            ...place,
            type: 'place',
          };
          if (placeWithMetadata.room.name === null) {
            (placeWithMetadata.room.name as string | undefined) = undefined;
          }
          const agendaItem = commitmentsByPlaceId[place.id];
          if (agendaItem) {
            placeWithMetadata.agendaItem = agendaItem;
          }
          const recentlyVisited = recentPlacesByPlaceId[place.id];
          if (recentlyVisited != null) {
            placeWithMetadata.recentlyVisited = recentlyVisited;
          }
          return placeWithMetadata;
        }) ?? [],
      );
      return db;
    },
    {
      enabled: siteId != null && fetchedPlaces,
    },
  );
};

const PLACES_SEARCH_QUERY_KEY = 'places-search';

export const useSearchPlaces = ({
  siteId,
  search,
  floorId,
  categoryId,
  subCategoryId,
}: UseSearchPlacesOptions) => {
  const { data: placesDb, isFetched: siteIndexed } = useGetPlacesSearchDb({
    siteId,
  });

  const query = useQuery(
    [
      PLACES_SEARCH_QUERY_KEY,
      siteId,
      floorId,
      categoryId,
      subCategoryId,
      search,
    ],
    async () => {
      const fullTextQuery: FullTextQuery & {
        where: Exclude<FullTextQuery['where'], undefined>;
      } = {
        where: { 'site.id': siteId },
        limit: 10000,
      };
      if (floorId && !search) {
        fullTextQuery.where['floor.id'] = floorId;
      }
      if (categoryId) {
        fullTextQuery.where['category.id'] = categoryId;
      }
      if (subCategoryId) {
        fullTextQuery.where['category.subCategory.id'] = subCategoryId;
      }
      if (search) {
        fullTextQuery.term = search;
      }
      const results = await fullTextSearch(placesDb!, fullTextQuery);
      return results as Results<PlaceOverviewWithMetadata>;
    },
    {
      enabled: placesDb != null && siteId != null && siteIndexed,
      staleTime: 30 * 1000,
    },
  );

  const extendedQuery = query as typeof query & { siteIndexed: boolean };
  extendedQuery.siteIndexed = siteIndexed;

  return extendedQuery;
};
