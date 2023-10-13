import { Text } from '@lib/ui/components/Text';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MarkerView } from '@rnmapbox/maps';

import { useGetPlaces } from '../../../core/queries/placesHooks';
import { PlacesStackParamList } from './PlacesNavigator';

interface Props {
  search?: string;
  siteId?: string;
  placeType?: string;
}

export const PlacesMarkers = ({
  placeType,
  search = 'aula',
  siteId,
}: Props) => {
  const { navigate } =
    useNavigation<StackNavigationProp<PlacesStackParamList>>();
  const { params } = useRoute<RouteProp<PlacesStackParamList, 'Places'>>();
  const { data: places, isLoading } = useGetPlaces({
    search,
    siteId,
  });

  if (isLoading || !places?.data.length) {
    return null;
  }

  return (
    <>
      <MarkerView
        coordinate={[45.06238763859395, 7.661483461842376]}
        // title="Aula 1"
      />
      <MarkerView
        coordinate={[45.06238763859395, 7.661483461842376]}
        // title="Aula 1"
      >
        <Text
          variant="secondaryText"
          style={{ marginTop: 24, fontWeight: '600', textTransform: 'none' }}
        >
          Aula 1
        </Text>
      </MarkerView>

      <MarkerView
        coordinate={[45.063052912286565, 7.661802285142166]}
        // title="Aula 2"
      />
      <MarkerView
        coordinate={[45.063052912286565, 7.661802285142166]}
        // title="Aula 2"
      >
        <Text
          variant="secondaryText"
          style={{ marginTop: 24, fontWeight: '600', textTransform: 'none' }}
        >
          Aula 2
        </Text>
      </MarkerView>

      <MarkerView
        coordinate={[45.06307350308532, 7.661642019310194]}
        // title="Aula 4"
      />
      <MarkerView
        coordinate={[45.06307350308532, 7.661642019310194]}
        // title="Aula 4"
      >
        <Text
          variant="secondaryText"
          style={{ marginTop: 24, fontWeight: '600', textTransform: 'none' }}
        >
          Aula 4
        </Text>
      </MarkerView>
      {/* {places.data.map(place => {*/}
      {/*  return (*/}
      {/*    <MapMarker*/}
      {/*      coordinate={{*/}
      {/*        latitude: +place.latitude,*/}
      {/*        longitude: +place.longitude,*/}
      {/*      }}*/}
      {/*      title={place.name}*/}
      {/*      description={place.type}*/}
      {/*    />*/}
      {/*  );*/}
      {/* })}*/}
    </>
  );
};
