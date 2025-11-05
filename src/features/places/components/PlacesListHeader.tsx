import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
  faCircleDot,
  faEllipsisV,
  faFlagCheckered,
} from '@fortawesome/free-solid-svg-icons';
import { BottomSheetTextField } from '@lib/ui/components/BottomSheetTextField';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PlaceOverview } from '@polito/api-client';

import { Checkbox } from '../../../core/components/Checkbox';
import { StatisticsContainer } from './StatisticsContainer';

interface PlacesListHeaderProps {
  isExpandedStart: boolean;
  isExpandedDest: boolean;
  searchStart: string;
  searchDest: string;
  computeButtonState: number;
  distance: number;
  stairs: number;
  elevators: number;
  avoidStairs: boolean;
  dark: boolean;

  setIsExpandedStart: (value: boolean) => void;
  setIsExpandedDest: (value: boolean) => void;
  handleSearchStart: (text: string) => void;
  handleSearchDest: (text: string) => void;
  handleRoom: (room: PlaceOverview | undefined, isStartRoom: boolean) => void;
  handleDebouncedSearch: (text: string) => void;
  handleComputeButtonState: (num: number) => void;
  setAvoidStairs: (value: boolean) => void;

  triggerSearchStart?: () => void;
  triggerSearchDest?: () => void;
}

const PlacesListHeaderComponent = ({
  isExpandedStart,
  isExpandedDest,
  searchStart,
  searchDest,
  computeButtonState,
  distance,
  stairs,
  elevators,
  avoidStairs,
  setIsExpandedStart,
  setIsExpandedDest,
  handleSearchStart,
  handleSearchDest,
  handleRoom,
  handleDebouncedSearch,
  handleComputeButtonState,
  setAvoidStairs,
  triggerSearchStart,
  triggerSearchDest,
}: PlacesListHeaderProps) => {
  const { dark, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.bottomSheetContent}>
      <View style={styles.selector}>
        <View style={styles.grid}>
          {!isExpandedStart && !isExpandedDest && (
            <View style={styles.icons}>
              <Icon
                icon={faCircleDot}
                color={palettes.gray[dark ? 300 : 600]}
              />
              <Icon
                icon={faEllipsisV}
                color={palettes.gray[dark ? 300 : 600]}
              />
              <Icon
                icon={faFlagCheckered}
                color={palettes.gray[dark ? 300 : 600]}
              />
            </View>
          )}
          <View style={styles.inputs}>
            {!isExpandedDest && (
              <BottomSheetTextField
                label={t('indicationsScreen.fromPlaceLabel')}
                onBlur={() => triggerSearchStart?.()}
                returnKeyType="search"
                onSubmitEditing={() => {
                  triggerSearchStart?.();
                }}
                value={searchStart}
                isClearable={!!searchStart}
                onChangeText={(text: string) => {
                  setIsExpandedStart(true);
                  handleSearchStart(text);
                }}
                onClear={() => {
                  handleRoom(undefined as any, true);
                  handleSearchStart('');
                  handleDebouncedSearch('');
                  setIsExpandedStart(false);
                  handleComputeButtonState(0);
                }}
                onPress={() => {
                  setIsExpandedStart(true);
                  setIsExpandedDest(false);
                }}
                style={styles.filter}
              />
            )}
            {!isExpandedStart && (
              <BottomSheetTextField
                label={t('indicationsScreen.toPlaceLabel')}
                onBlur={() => triggerSearchDest?.()}
                returnKeyType="search"
                onSubmitEditing={() => {
                  triggerSearchDest?.();
                }}
                value={searchDest}
                isClearable={!!searchDest}
                onChangeText={(text: string) => {
                  setIsExpandedDest(true);
                  handleSearchDest(text);
                }}
                onClear={() => {
                  handleRoom(undefined as any, false); //#TODO fix any
                  handleSearchDest('');
                  handleDebouncedSearch('');
                  setIsExpandedDest(false);
                  handleComputeButtonState(0);
                }}
                onPress={() => {
                  setIsExpandedDest(true);
                  setIsExpandedStart(false);
                }}
                style={styles.filter}
              />
            )}
          </View>
        </View>
        {computeButtonState > 0 &&
          distance > 0 &&
          !isExpandedDest &&
          !isExpandedStart && (
            <View style={styles.statisticsContainer}>
              <StatisticsContainer
                totDistance={distance}
                stairs={stairs}
                elevators={elevators}
              />
            </View>
          )}
        {!isExpandedDest && !isExpandedStart && (
          <View style={styles.stairsButtonContainer}>
            <Text
              style={[
                styles.textStairsButton,
                { color: palettes.primary[600] },
              ]}
            >
              {t('indicationsScreen.avoidStairs')}
            </Text>
            <View style={styles.checkBox}>
              <Checkbox
                onPress={() => setAvoidStairs(!avoidStairs)}
                isChecked={avoidStairs}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    bottomSheetContent: {
      display: 'flex',
      width: '100%',
      paddingVertical: 18,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 40,
    },
    selector: {
      display: 'flex',
      paddingVertical: 6,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    grid: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      alignItems: 'flex-start',
      paddingHorizontal: 18,
      gap: 9,
      alignSelf: 'stretch',
    },
    icons: {
      display: 'flex',
      width: 16,
      paddingVertical: '1.5%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '13%',
      flexShrink: 0,
      alignSelf: 'stretch',
    },
    inputs: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: 0,
      alignSelf: 'stretch',
    },
    filter: {
      display: 'flex',
      paddingVertical: 6,
      paddingHorizontal: 9,
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: 6,
    },
    text: {
      overflow: 'hidden',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 21,
    },
    stairsButtonContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      paddingTop: 18,
      paddingBottom: 60,
      paddingHorizontal: 18,
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 20,
    },
    textStairsButton: {
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: 21 /* 21 px */,
    },
    checkBox: {
      display: 'flex',
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    statisticsContainer: {
      padding: 18,
    },
  });

export const PlacesListHeader = memo(PlacesListHeaderComponent);
