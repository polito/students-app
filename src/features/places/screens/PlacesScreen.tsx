import { useLayoutEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { globalStyles } from '../../../core/styles/globalStyles';
import { CampusSelector } from '../components/CampusSelector';
import { PlacePanel } from '../components/PlacePanel';
import { PlaceTypePanel } from '../components/PlaceTypePanel';
import { PlacesStackParamList } from '../components/PlacesNavigator';

type Props = NativeStackScreenProps<PlacesStackParamList, 'Places'>;

export const PlacesScreen = ({ navigation, route }: Props) => {
  const { colors, fontSizes, shapes } = useTheme();
  const [searching, setSearching] = useState(false);
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faSearch}
          color={colors.primary[400]}
          size={fontSizes.lg}
          adjustSpacing="right"
          onPress={() => setSearching(true)}
        />
      ),
    });
  }, [navigation, searching]);

  const { placeType, placeId, campusId } = route.params ?? {};

  return (
    <>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 45.06255980528532,
          longitude: 7.662322058238708,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: Platform.select({ ios: headerHeight, android: 0 }),
          bottom: bottomTabBarHeight - 1,
        }}
        pointerEvents="box-none"
      >
        <View>
          <TranslucentView />
          <Tabs
            style={{
              minWidth: '100%',
              borderTopWidth: Platform.select({
                ios: StyleSheet.hairlineWidth,
              }),
              borderBottomWidth: Platform.select({
                ios: StyleSheet.hairlineWidth,
              }),
              borderColor: colors.divider,
              elevation: 3,
              zIndex: 1,
            }}
          >
            <Tab
              selected={route.params?.placeType === 'classrooms'}
              onPress={() =>
                navigation.navigate('Places', { placeType: 'classrooms' })
              }
            >
              Classrooms
            </Tab>
            <Tab
              selected={route.params?.placeType === 'libraries'}
              onPress={() =>
                navigation.navigate('Places', { placeType: 'libraries' })
              }
            >
              Libraries
            </Tab>
            <Tab
              selected={route.params?.placeType === 'study-rooms'}
              onPress={() =>
                navigation.navigate('Places', { placeType: 'study-rooms' })
              }
            >
              Study rooms
            </Tab>
            <Tab
              selected={route.params?.placeType === 'student'}
              onPress={() =>
                navigation.navigate('Places', { placeType: 'student' })
              }
            >
              Student services
            </Tab>
          </Tabs>
        </View>

        <View style={globalStyles.grow} pointerEvents="box-none">
          <BottomSheet
            index={placeType != null || placeId != null ? 0 : -1}
            snapPoints={[placeId ? '50%' : '25%', '100%']}
            overDragResistanceFactor={0.9}
            enablePanDownToClose
            style={{
              borderTopLeftRadius: shapes.lg,
              borderTopRightRadius: shapes.lg,
              overflow: 'hidden',
            }}
            handleIndicatorStyle={{
              backgroundColor: colors.divider,
            }}
            backgroundComponent={() => <TranslucentView />}
            onClose={() => {
              if (placeId != null || placeType != null) {
                navigation.navigate('Places', {
                  placeType: null,
                  placeId: null,
                });
              }
            }}
          >
            {placeId != null ? (
              <PlacePanel placeId={placeId} />
            ) : placeType != null ? (
              <PlaceTypePanel placeType={placeType} />
            ) : null}
          </BottomSheet>

          {placeType == null && placeId == null && (
            <CampusSelector campusId={campusId} />
          )}
        </View>
      </View>
    </>
  );
};
