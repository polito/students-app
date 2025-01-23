import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CATEGORY_MARKER } from '../constants';
import { SearchPlace, isPlace } from '../types';
import { usePlaceCategoriesMap } from './usePlaceCategoriesMap';

/**
 * Converts a place or building to a list item object
 */
export const useSearchPlaceToListItem = () => {
  const { t } = useTranslation();
  const placeCategoriesMap = usePlaceCategoriesMap();

  return useCallback(
    (place: SearchPlace, isRecentlyViewed = false) => {
      const markerUrl = !placeCategoriesMap
        ? DEFAULT_CATEGORY_MARKER.markerUrl
        : place.category?.subCategory?.id
        ? placeCategoriesMap[place.category.subCategory.id].markerUrl
        : place.category.id
        ? placeCategoriesMap[place.category.id]?.markerUrl
        : DEFAULT_CATEGORY_MARKER.markerUrl;
      return {
        title: isPlace(place)
          ? place.room.name ?? place.category.subCategory?.name
          : place.name,
        subtitle: isPlace(place)
          ? `${
              isRecentlyViewed
                ? t('common.recentlyViewed')
                : place.category.name
            } - ${place.floor.name}`
          : t('common.building'),
        linkTo: isPlace(place)
          ? { screen: 'Place', params: { placeId: place.id } }
          : { screen: 'Building', params: { buildingId: place.id } },
        // leadingItem: (
        //   <Image source={{ uri: markerUrl }} width={30} height={30} />
        // ),
      };
    },
    [placeCategoriesMap, t],
  );
};
