import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import {
  faArrowsUpDown,
  faChalkboardUser,
  faLocationDot,
  faSchool,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Col } from '@lib/ui/components/Col';
import { Divider } from '@lib/ui/components/Divider';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { PillDropdownActivator } from '@lib/ui/components/PillDropdownActivator';
import { Row } from '@lib/ui/components/Row';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { IS_IOS } from '../../../core/constants';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesStackParamList } from '../components/PlacesNavigator';

type Props = MapScreenProps<PlacesStackParamList, 'PlacesSearch'>;

export const PlacesSearchScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { palettes, fontSizes } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const { width: windowWidth } = Dimensions.get('window');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TranslucentTextField
          label={t('common.search')}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: windowWidth - 120,
            marginLeft: IS_IOS ? '-13%' : undefined,
            marginBottom: 3,
          }}
        />
      ),
      headerRight: () =>
        Platform.select({
          android: (
            <IconButton
              icon={faSearch}
              size={fontSizes.xl}
              color={palettes.primary[400]}
              accessibilityLabel={t('common.search')}
            />
          ),
          ios: (
            <Row mr={3}>
              <TextButton>{t('common.done')}</TextButton>
            </Row>
          ),
        }),
    });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Col flex={1} pointerEvents={searchFocused ? undefined : 'box-none'}>
        <Col>
          <TranslucentView />
          <Tabs
            style={{
              minWidth: '100%',
              elevation: 3,
              zIndex: 1,
            }}
          >
            <PillDropdownActivator
              onPress={() =>
                navigation.navigate('PlaceCategory', {
                  categoryId: 'classrooms',
                })
              }
            >
              <Icon icon={faLocationDot} />
              <Text>Category</Text>
            </PillDropdownActivator>

            <PillDropdownActivator
              onPress={() =>
                navigation.navigate('PlaceCategory', {
                  categoryId: 'classrooms',
                })
              }
            >
              <Icon icon={faSchool} />
              <Text>Campus</Text>
            </PillDropdownActivator>

            <PillDropdownActivator
              onPress={() =>
                navigation.navigate('PlaceCategory', {
                  categoryId: 'classrooms',
                })
              }
            >
              <Icon icon={faBuilding} />
              <Text>Building</Text>
            </PillDropdownActivator>

            <PillDropdownActivator
              onPress={() =>
                navigation.navigate('PlaceCategory', {
                  categoryId: 'classrooms',
                })
              }
            >
              <Icon icon={faArrowsUpDown} />
              <Text>Floor</Text>
            </PillDropdownActivator>
          </Tabs>
          <Divider />
        </Col>

        <Col flex={1}>
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
        </Col>
      </Col>
    </TouchableWithoutFeedback>
  );
};
