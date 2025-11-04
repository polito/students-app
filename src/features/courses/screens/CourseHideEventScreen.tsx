import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { faSquareMinus } from '@fortawesome/free-regular-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator.tsx';
import { Col } from '@lib/ui/components/Col.tsx';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton.tsx';
import { OverviewList } from '@lib/ui/components/OverviewList.tsx';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { t } from 'i18next';
import { DateTime, WeekdayNumbers } from 'luxon';

import { Checkbox } from '../../../core/components/Checkbox.tsx';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetPlace } from '../../../core/queries/placesHooks.ts';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseHiddenRecurrence } from '../types/Recurrence';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseHideEvent'>;

interface HideEventProps {
  item: CourseHiddenRecurrence;
  updateItemVisibility: (
    element: CourseHiddenRecurrence,
    newVisibility: boolean,
  ) => void;
}

const enum CheckboxState {
  SELECTED,
  NOT_ALL_SELECTED,
  UNSELECTED,
}

const HideEventCard = ({ item, updateItemVisibility }: HideEventProps) => {
  const styles = useStylesheet(createStyles);
  const { data: place, isLoading: placeLoading } = useGetPlace(item.room);

  const handleVisibilityChange = () => {
    updateItemVisibility(item, !item.restoreVisibility);
  };

  const getLongDayTime = (day: number) => {
    const dayTime = DateTime.now().set({ weekday: day as WeekdayNumbers });
    const dayName = dayTime.toFormat('cccc');
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  };

  const eventTime = `${getLongDayTime(item.day)} ${item.start}-${item.end}`;
  const placeName = place?.room.name || '';
  const checkboxText = placeName
    ? t('courseHideEventScreen.eventWithRoom', {
        time: eventTime,
        room: placeName,
      })
    : t('courseHideEventScreen.eventWithoutRoom', { time: eventTime });

  return (
    <Row style={styles.card}>
      <Checkbox
        onPress={handleVisibilityChange}
        isChecked={item.restoreVisibility}
        containerStyle={styles.checkbox}
        text={checkboxText}
      />
      <Col style={styles.cardCol}>
        <Row align="center">
          <Text variant="heading" style={styles.title}>
            {eventTime}
          </Text>
        </Row>
        {placeLoading && <ActivityIndicator size="small" />}
        {Boolean(item.room && place) && (
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {place?.room?.name}
          </Text>
        )}
      </Col>
      <View></View>
    </Row>
  );
};

export const CourseHideEventScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet(createStyles);
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(() => {
    return coursesPrefs[route.params.uniqueShortcode];
  }, [route.params.uniqueShortcode, coursesPrefs]);
  const [selectAll, setSelectAll] = useState<CheckboxState>(
    CheckboxState.UNSELECTED,
  );
  const [items, setItems] = useState<CourseHiddenRecurrence[]>(() => {
    return (
      coursesPrefs[route.params.uniqueShortcode].itemsToHideInAgenda?.map(
        item => {
          return { ...item, restoreVisibility: false };
        },
      ) ?? []
    );
  });

  const selectAllItem = () => {
    setSelectAll(old => {
      const newState =
        old < 2 ? CheckboxState.UNSELECTED : CheckboxState.SELECTED;
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          restoreVisibility: newState === CheckboxState.SELECTED,
        })),
      );
      return newState;
    });
  };

  const updateItemVisibility = (
    element: CourseHiddenRecurrence,
    newVisibility: boolean,
  ) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item === element ? { ...item, restoreVisibility: newVisibility } : item,
      ),
    );
  };

  const onPress = () => {
    const itemsToDelete = items.filter(item => item.restoreVisibility);

    if (itemsToDelete.length > 0) {
      updatePreference('courses', {
        ...coursesPrefs,
        [route.params.uniqueShortcode]: {
          ...coursePrefs,
          itemsToHideInAgenda: coursePrefs.itemsToHideInAgenda?.filter(
            recurrence =>
              !itemsToDelete.some(
                item =>
                  item.start === recurrence.start &&
                  item.end === recurrence.end &&
                  item.day === recurrence.day &&
                  item.room === recurrence.room,
              ),
          ),
        },
      });
    }

    setItems(prevItems =>
      prevItems.filter(
        item => !itemsToDelete.some(deletedItem => deletedItem === item),
      ),
    );
  };

  useEffect(() => {
    if (!coursePrefs.itemsToHideInAgenda?.length) {
      navigation.pop();
    }
  }, [coursePrefs.itemsToHideInAgenda, navigation]);

  useEffect(() => {
    setSelectAll(
      items.filter(item => item.restoreVisibility).length === items.length
        ? CheckboxState.SELECTED
        : items.filter(item => item.restoreVisibility).length > 0
          ? CheckboxState.NOT_ALL_SELECTED
          : CheckboxState.UNSELECTED,
    );
  }, [items]);

  useEffect(() => {
    setItems(
      coursePrefs.itemsToHideInAgenda?.map(item => ({
        ...item,
        restoreVisibility: false,
      })) ?? [],
    );
  }, [coursePrefs.itemsToHideInAgenda]);

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SafeAreaView>
          <Checkbox
            onPress={() => selectAllItem()}
            isChecked={
              CheckboxState.SELECTED === selectAll ||
              CheckboxState.NOT_ALL_SELECTED === selectAll
            }
            containerStyle={styles.smallCheckbox}
            dimension="small"
            text={t('courseHideEventScreen.selectItems')}
            textStyle={styles.textSmallCheckbox}
            icon={
              CheckboxState.NOT_ALL_SELECTED === selectAll
                ? faSquareMinus
                : undefined
            }
          />
          <OverviewList>
            {items.map(item => (
              <HideEventCard
                key={`${item.day}-${item.start}-${item.end}-${item.room}`}
                item={item}
                updateItemVisibility={updateItemVisibility}
              />
            ))}
          </OverviewList>
        </SafeAreaView>
      </ScrollView>
      <CtaButton
        title={t('courseHideEventScreen.button')}
        action={onPress}
        disabled={!items.filter(item => item.restoreVisibility).length}
      />
      <CtaButtonSpacer />
    </>
  );
};

const createStyles = ({ spacing, fontSizes, palettes, dark }: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      marginHorizontal: spacing[2.5],
      marginVertical: spacing[2],
      padding: spacing[3],
      overflow: 'visible',
      alignItems: 'center',
    },
    cardCol: {
      flexShrink: 1,
      paddingRight: spacing[5],
    },
    title: {
      fontSize: fontSizes.md,
      flexShrink: 1,
    },
    label: {
      marginTop: spacing[1.5],
    },
    smallCheckbox: {
      marginHorizontal: spacing[2.5],
      marginTop: spacing[4],
      marginBottom: spacing[1.5],
    },
    textSmallCheckbox: {
      color: palettes.navy[dark ? '50' : '800'],
    },
    checkbox: { marginHorizontal: 0 },
  });
