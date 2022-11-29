import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { PlacesStackParamList } from './PlacesNavigator';

interface Props {
  placeType: string;
}

export const PlaceTypePanel = ({ placeType }: Props) => {
  const { fontSizes } = useTheme();
  const { navigate } =
    useNavigation<StackNavigationProp<PlacesStackParamList>>();

  return (
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
          isNavigationAction
          title={item.title}
          subtitle={item.address}
          leadingItem={<Icon icon={faChalkboardUser} size={fontSizes['2xl']} />}
          onPress={() => navigate('Places', { placeId: 1 })}
        />
      )}
      ItemSeparatorComponent={IndentedDivider}
    />
  );
};
