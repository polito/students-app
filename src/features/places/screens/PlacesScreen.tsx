import { useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';

import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { PillButton } from '@lib/ui/components/PillButton';
import { Row } from '@lib/ui/components/Row';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { BuildingParamsSelector } from '../components/BuildingParamsSelector';
import { CampusSelector } from '../components/CampusSelector';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesBottomSheet } from '../components/PlacesBottomSheet';
import { PlacesStackParamList } from '../components/PlacesNavigator';

type Props = MapScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation }: Props) => {
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLogo ml={5} />,
      headerRight: () => <CampusSelector />,
      // mapContent: <PlacesMarkers />,
    });
  }, [navigation]);

  useEffect(() => {
    request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  }, []);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <Tabs
        style={{
          minWidth: '100%',
          elevation: 3,
        }}
      >
        <PillButton
          onPress={() =>
            navigation.navigate('PlaceCategory', { categoryId: 'classrooms' })
          }
        >
          Classrooms
        </PillButton>
        <PillButton
          onPress={() =>
            navigation.navigate('PlaceCategory', { categoryId: 'libraries' })
          }
        >
          Libraries
        </PillButton>
        <PillButton
          onPress={() =>
            navigation.navigate('PlaceCategory', {
              categoryId: 'study-rooms',
            })
          }
        >
          Study rooms
        </PillButton>
        <PillButton
          onPress={() =>
            navigation.navigate('PlaceCategory', { categoryId: 'student' })
          }
        >
          Student services
        </PillButton>
        <PillButton onPress={() => setCategoriesPanelOpen(true)}>
          <Row align="center" gap={2}>
            <Icon icon={faEllipsis} />
            <Text>More</Text>
          </Row>
        </PillButton>
      </Tabs>

      <BuildingParamsSelector />

      <PlacesBottomSheet index={0} listProps={{ data: [{ title: 'Test' }] }} />

      <PlacesBottomSheet
        enablePanDownToClose={true}
        snapPoints={['100%']}
        index={categoriesPanelOpen ? 0 : -1}
        onClose={() => setCategoriesPanelOpen(false)}
        textFieldProps={{ label: 'Search categories' }}
        listProps={{
          data: [
            {
              title: 'Classrooms',
            },
            {
              title: 'Study rooms',
            },
            {
              title: 'Student services',
            },
            {
              title: 'Bathrooms',
            },
            {
              title: 'Caffetterias',
            },
            {
              title: 'Restaurants',
            },
          ],
        }}
      />
    </View>
  );
};
