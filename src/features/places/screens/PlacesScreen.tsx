import { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

import { faEllipsis, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { PillButton } from '@lib/ui/components/Pill';
import { Row } from '@lib/ui/components/Row';
import { Tabs } from '@lib/ui/components/Tabs';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { BuildingParamsSelector } from '../components/BuildingParamsSelector';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesMarkers } from '../components/PlacesMarkers';
import { PlacesStackParamList } from '../components/PlacesNavigator';
import { SearchHeaderCta } from '../components/SearchHeaderCta';

type Props = MapScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation }: Props) => {
  const { fontSizes } = useTheme();
  const [categoriesPanelOpen, setCategoriesPanelOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLogo ml={5} />,
      headerRight: () => <SearchHeaderCta />,
      mapContent: <PlacesMarkers />,
    });
  }, [navigation]);

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

      <BottomSheet
        index={categoriesPanelOpen ? 0 : -1}
        snapPoints={['100%']}
        enablePanDownToClose
        onClose={() => setCategoriesPanelOpen(false)}
      >
        <BottomSheetFlatList
          data={[
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
          ]}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              leadingItem={
                <Icon icon={faLocationDot} size={fontSizes['2xl']} />
              }
              linkTo={{
                screen: 'PlaceCategory',
                params: { categoryId: 1 },
              }}
            />
          )}
          ItemSeparatorComponent={IndentedDivider}
        />
      </BottomSheet>
    </View>
  );
};
