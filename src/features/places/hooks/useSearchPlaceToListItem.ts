import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchPlace, isPlace } from '../types';

/**
 * Converts a place or building to a list item object
 */
export const useSearchPlaceToListItem = () => {
  const { t } = useTranslation();

  return useCallback(
    (place: SearchPlace, isRecentlyViewed = false) => {
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
    [t],
  );
};
