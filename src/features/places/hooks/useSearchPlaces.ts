import { useMemo, useState } from 'react';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetPlaces } from '../../../core/queries/placesHooks';
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
  floorId?: string | null;
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

  const [now] = useState(DateTime.now());
  const { data: agendaPages } = useGetAgendaWeeks(coursesPreferences, now);
  const upcomingCommitments = useMemo(
    () =>
      agendaPages?.pages?.[0]?.data
        .flatMap(i => i.items)
        .filter(
          i =>
            (i as LectureItem).place != null &&
            ((i.start >= now &&
              i.start.diff(now).milliseconds <
                UPCOMING_COMMITMENT_HOURS_OFFSET * 60 * 60 * 1000) ||
              (i.start <= now && i.end >= now)),
        ) as
        | (LectureItem & { place: Exclude<LectureItem['place'], null> })[]
        | undefined,
    [agendaPages?.pages, now],
  );

  const { data: places, fetchStatus: placesFetchStatus } = useGetPlaces({
    siteId: actualSiteId,
    floorId: search?.length ? null : floorId,
    placeCategoryId: categoryId,
    placeSubCategoryId: subCategoryId ? [subCategoryId] : undefined,
  });

  // const { data: buildings, fetchStatus: buildingFetchStatus } =
  //   useGetBuildings(actualSiteId);

  const combinedPlaces = useMemo(() => {
    if (!places?.data?.length) {
      return [];
    }
    let result = places?.data
      ?.map(p => ({ ...p, type: 'place' }))
      ?.sort(a => (placesSearched.some(p => a.id === p.id) ? -1 : 1)) as
      | (PlaceOverviewWithMetadata | BuildingWithMetadata)[]
      | undefined;
    if (upcomingCommitments?.length) {
      for (const commitment of upcomingCommitments.reverse()) {
        const placeIndex = result!.findIndex(
          p => p.id === resolvePlaceId(commitment.place),
        );
        if (placeIndex !== -1) {
          const place = result!.splice(
            placeIndex,
            1,
          )[0] as PlaceOverviewWithMetadata;
          place.agendaItem = commitment;
          result!.unshift(place);
        }
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
    return result;
  }, [places?.data, placesSearched, search, upcomingCommitments]);

  return {
    places: combinedPlaces,
    isLoading:
      placesFetchStatus ===
      'fetching' /* || buildingFetchStatus === 'fetching'*/,
  };
};
