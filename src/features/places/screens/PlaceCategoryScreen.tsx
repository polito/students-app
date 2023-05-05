import { useLayoutEffect } from 'react';
import { View } from 'react-native';

import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesMarkers } from '../components/PlacesMarkers';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { SearchHeaderCta } from '../components/SearchHeaderCta';

type Props = MapScreenProps<PlacesStackParamList, 'PlaceCategory'>;

export const PlaceCategoryScreen = ({ navigation, route }: Props) => {
  const { fontSizes } = useTheme();
  const { categoryId } = route.params ?? {};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <SearchHeaderCta />,
      mapContent: <PlacesMarkers />,
    });
  }, [navigation]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet>
        <BottomSheetFlatList
          data={[
            {
              title: 'Aula 1',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 2',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 3',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 4',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 5',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 6',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 7',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 8',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 9',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 10',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 11',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 12',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 13',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 14',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 15',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 16',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 17',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 18',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 19',
              address: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
          ]}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={item.address}
              leadingItem={
                <Icon icon={faChalkboardUser} size={fontSizes['2xl']} />
              }
              linkTo={{
                screen: 'Place',
                params: { placeId: 1 },
              }}
            />
          )}
          ItemSeparatorComponent={IndentedDivider}
        />
      </BottomSheet>
    </View>
  );
};
