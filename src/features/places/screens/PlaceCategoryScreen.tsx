import { useLayoutEffect } from 'react';
import { View } from 'react-native';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CampusSelector } from '../components/CampusSelector';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesMarkers } from '../components/PlacesMarkers';
import { PlacesStackParamList } from '../components/PlacesNavigator';

type Props = MapScreenProps<PlacesStackParamList, 'PlaceCategory'>;

export const PlaceCategoryScreen = ({ navigation, route }: Props) => {
  const { categoryId } = route.params ?? {};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <CampusSelector />,
      mapContent: <PlacesMarkers />,
    });
  }, [navigation]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <PlacesBottomSheet
        listProps={{
          data: [
            {
              title: 'Aula 1',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 2',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 3',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 4',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 5',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 6',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 7',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 8',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 9',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 10',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 11',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 12',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 13',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 14',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 15',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 16',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 17',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 18',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
            {
              title: 'Aula 19',
              subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino',
            },
          ],
        }}
      />
    </View>
  );
};
