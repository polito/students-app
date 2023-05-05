import { useLayoutEffect } from 'react';
import { View } from 'react-native';

import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Text } from '@lib/ui/components/Text';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { SearchHeaderCta } from '../components/SearchHeaderCta';

type Props = MapScreenProps<PlacesStackParamList, 'Place'>;

export const PlaceScreen = ({ navigation }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <SearchHeaderCta />,
    });
  }, [navigation]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet middleSnapPoint={50}>
        <Text>Place</Text>
      </BottomSheet>
    </View>
  );
};
