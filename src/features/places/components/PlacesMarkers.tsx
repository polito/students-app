import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

  console.log('Places');
  if (isLoading || !places?.data.length) {
    return null;
  }

  console.log('Places', places?.data);
  return (
    <>
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
