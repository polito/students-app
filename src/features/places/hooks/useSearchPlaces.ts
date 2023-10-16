import { useMemo, useRef } from 'react';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import {
  useGetBuildings,
  useGetPlaces,
} from '../../../core/queries/placesHooks';
import { useGetAgendaWeeks } from '../../agenda/queries/agendaHooks';
import { LectureItem } from '../../agenda/types/AgendaItem';
import { UPCOMING_COMMITMENT_HOURS_OFFSET } from '../constants';
import {
  BuildingWithMetadata,
  PlaceOverviewWithMetadata,
  isPlace,
} from '../types';
import { resolvePlaceId } from '../utils/resolvePlaceId';
import { useGetCurrentCampus } from './useGetCurrentCampus';

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
}: UseSearchPlacesOptions) => {
  const { courses: coursesPreferences, placesSearched } =
    usePreferencesContext();

  const campus = useGetCurrentCampus();
  const actualSiteId = siteId ?? campus?.id;

  const now = useRef(DateTime.now());
  const { data: agendaPages } = useGetAgendaWeeks(
    coursesPreferences,
    now.current,
  );
  const upcomingCommitments = useMemo(
    () =>
      agendaPages?.pages?.[0]?.data
        .flatMap(i => i.items)
        .filter(
          i =>
            (i as LectureItem).place != null &&
            ((i.start >= now.current &&
              i.start.diff(now.current).milliseconds <
                UPCOMING_COMMITMENT_HOURS_OFFSET * 60 * 60 * 1000) ||
              (i.start <= now.current && i.end >= now.current)),
        ) as
        | (LectureItem & { place: Exclude<LectureItem['place'], null> })[]
        | undefined,
    [agendaPages],
  );

  const { data: places, fetchStatus: placesFetchStatus } = useGetPlaces({
    siteId: actualSiteId,
    floorId: search?.length ? undefined : floorId,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
  });

  const { data: buildings, fetchStatus: buildingFetchStatus } =
    useGetBuildings(actualSiteId);

  const combinedPlaces = useMemo(() => {
    let result = places?.data
      ?.map(p => ({ ...p, type: 'place' }))
      ?.sort(a => (placesSearched.some(p => a.id === p.id) ? -1 : 1)) as
      | (PlaceOverviewWithMetadata | BuildingWithMetadata)[]
      | undefined;
    if (!upcomingCommitments?.length || !result?.length) {
      return result;
    }
    for (const commitment of upcomingCommitments.reverse()) {
      const placeIndex = result.findIndex(
        p => p.id === resolvePlaceId(commitment.place),
      );
      if (placeIndex !== -1) {
        const place = result.splice(
          placeIndex,
          1,
        )[0] as PlaceOverviewWithMetadata;
        place.agendaItem = commitment;
        result.unshift(place);
      }
    }
    // if (buildings?.data?.length) {
    //   result = result?.concat(
    //     buildings.data.map(b => ({
    //       ...b,
    //       type: 'building',
    //     })),
    //   );
    // }
    if (search) {
      result = result?.filter(p => {
        if (isPlace(p)) {
          return (
            p.room.name?.toLowerCase().includes(search) ||
            p.category.name.toLowerCase().includes(search) ||
            p.category.subCategory?.name.toLowerCase().includes(search)
          );
        }
        return p.name.toLowerCase().includes(search);
      });
    }
    return result?.filter(p => p.latitude != null && p.longitude != null);
  }, [places?.data, placesSearched, search, upcomingCommitments]);

  return {
    places: combinedPlaces,
    isLoading:
      placesFetchStatus === 'fetching' || buildingFetchStatus === 'fetching',
  };
};
