import { useTranslation } from 'react-i18next';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceRef } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { notNullish } from '../../../utils/predicates';

type Props = {
  eventName: string;
  places: PlaceRef[] | undefined;
};
export const PlacesListItem = ({ places, eventName }: Props) => {
  const { fontSizes } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { t } = useTranslation();

  if (places === undefined) {
    return null;
  }

  const placeIds = places
    ?.map(p => {
      return p.buildingId && p.floorId && p.roomId
        ? [p.buildingId, p.floorId, p.roomId].join('-')
        : null;
    })
    .filter(notNullish) as string[] | null;

  return (
    <ListItem
      leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
      title={
        places.length > 0
          ? places.map(p => p.name).join(', ')
          : t('examScreen.noLocation')
      }
      subtitle={t('examScreen.location')}
      isAction={!!placeIds?.length}
      onPress={
        placeIds?.length
          ? () => {
              if (navigation.getId() === 'AgendaTabNavigator') {
                navigation.navigate('EventPlaces', {
                  placeIds,
                  eventName,
                  isCrossNavigation: true,
                });
              } else if (navigation.getId() === 'TeachingTabNavigator') {
                navigation.navigate('PlacesTeachingStack', {
                  screen: 'EventPlaces',
                  params: {
                    placeIds,
                    eventName,
                    isCrossNavigation: true,
                  },
                });
              }
            }
          : undefined
      }
    />
  );
};
