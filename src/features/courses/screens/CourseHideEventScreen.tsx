import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faSquareMinus } from '@fortawesome/free-regular-svg-icons';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator.tsx';
import { Badge } from '@lib/ui/components/Badge.tsx';
import { Col } from '@lib/ui/components/Col.tsx';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton.tsx';
import { OverviewList } from '@lib/ui/components/OverviewList.tsx';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { useGetPlace } from '~/core/queries/placesHooks';

import { DateTime, WeekdayNumbers } from 'luxon';

import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseHiddenEvent } from '../types/Recurrence';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CourseHideEvent'>;

interface HideEventProps {
  key: number;
  item: CourseHiddenEvent;
  updateItemVisibility: (
    element: CourseHiddenEvent,
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
  const { palettes, dark } = useTheme();
  const { t } = useTranslation();
  const { data: place, isLoading: placeLoading } = useGetPlace(item.room);

  const handleVisibilityChange = () => {
    updateItemVisibility(item, !item.restoreVisibility);
  };

  const getLongDayTime = (day: number) => {
    const dayTime = DateTime.now().set({ weekday: day as WeekdayNumbers });
    const dayName = dayTime.toFormat('cccc');
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  };

  return (
    <Row style={styles.card}>
      <Checkbox
        onPress={() => handleVisibilityChange()}
        isChecked={item.restoreVisibility}
        containerStyle={styles.checkbox}
        iconColor={palettes.navy[dark ? '50' : '400']}
      />
      <Col style={styles.cardCol}>
        <Row align="center" gap={2}>
          <Text variant="heading" style={styles.title}>
            {(item.type === 'recurrence'
              ? getLongDayTime(item.day)
              : getLongDayTime(DateTime.fromISO(item.day).day)) +
              '  ' +
              item.start +
              '-' +
              item.end}
          </Text>
          {item.type === 'recurrence' && (
            <Badge
              text={t('common.series')}
              backgroundColor={
                !dark ? palettes.lightBlue[50] : palettes.navy[600]
              }
              foregroundColor={
                !dark ? palettes.lightBlue[600] : palettes.lightBlue[300]
              }
              icon={faRepeat}
              style={{ borderRadius: 6 }}
            />
          )}
        </Row>
        {placeLoading && <ActivityIndicator size="small" />}
        {item.room && place && (
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {place.room.name}
          </Text>
        )}
      </Col>
    </Row>
  );
};

export const CourseHideEventScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { palettes, dark } = useTheme();
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursePrefs = useMemo(() => {
    return coursesPrefs[route.params.uniqueShortcode];
  }, [route.params.uniqueShortcode, coursesPrefs]);
  const [selectAll, setSelectAll] = useState<CheckboxState>(
    CheckboxState.UNSELECTED,
  );
  const [items, setItems] = useState<CourseHiddenEvent[]>(() => {
    const recurrenceItems =
      coursesPrefs[route.params.uniqueShortcode].itemsToHideInAgenda?.map(
        item => {
          return {
            type: 'recurrence' as const,
            ...item,
            restoreVisibility: false,
          };
        },
      ) ?? [];

    const singleItems =
      coursesPrefs[route.params.uniqueShortcode].singleItemsToHideInAgenda?.map(
        item => {
          return { type: 'single' as const, ...item, restoreVisibility: false };
        },
      ) ?? [];

    return [...recurrenceItems, ...singleItems];
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
    element: CourseHiddenEvent,
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
                  item.type === 'recurrence' &&
                  item.start === recurrence.start &&
                  item.end === recurrence.end &&
                  item.day === recurrence.day &&
                  item.room === recurrence.room,
              ),
          ),
          singleItemsToHideInAgenda:
            coursePrefs.singleItemsToHideInAgenda?.filter(
              recurrence =>
                !itemsToDelete.some(
                  item =>
                    item.type === 'single' &&
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
    if (
      !coursePrefs.itemsToHideInAgenda?.length &&
      !coursePrefs.singleItemsToHideInAgenda?.length
    ) {
      requestAnimationFrame(() => {
        navigation.pop();
      });
    }
  }, [
    coursePrefs.itemsToHideInAgenda,
    coursePrefs.singleItemsToHideInAgenda,
    navigation,
  ]);

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
    const recurrenceItems =
      coursePrefs.itemsToHideInAgenda?.map(item => ({
        type: 'recurrence' as const,
        ...item,
        restoreVisibility: false,
      })) ?? [];

    const singleItems =
      coursePrefs.singleItemsToHideInAgenda?.map(item => ({
        type: 'single' as const,
        ...item,
        restoreVisibility: false,
      })) ?? [];

    setItems([...recurrenceItems, ...singleItems]);
  }, [coursePrefs.itemsToHideInAgenda, coursePrefs.singleItemsToHideInAgenda]);

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
            iconColor={palettes.navy[dark ? '50' : '400']}
          />
          <OverviewList>
            {items.map((item, index) => (
              <HideEventCard
                key={index}
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
      marginVertical: spacing[1],
      padding: spacing[2],
      overflow: 'visible',
      alignItems: 'center',
    },
    cardCol: {
      flexShrink: 1,
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
      marginTop: spacing[2],
      marginBottom: spacing[1.5],
    },
    textSmallCheckbox: {
      color: palettes.navy[dark ? '50' : '800'],
    },
    checkbox: { marginHorizontal: 0 },
  });
