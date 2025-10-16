import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

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

import { Checkbox } from '~/core/components/Checkbox.tsx';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';
import { useGetCourses } from '~/core/queries/courseHooks.ts';
import { useGetPlace } from '~/core/queries/placesHooks.ts';

import { DateTime, WeekdayNumbers } from 'luxon';

import { CourseHiddenEvent } from '../../courses/types/Recurrence';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'HiddenEvents'>;

interface HiddenEventItemProps {
  item: CourseHiddenEvent;
  onToggle: (item: CourseHiddenEvent) => void;
}

interface CourseSection {
  title: string;
  courseShortcode: string;
  data: CourseHiddenEvent[];
}

const enum CheckboxState {
  SELECTED,
  NOT_ALL_SELECTED,
  UNSELECTED,
}

const HiddenEventItem = ({ item, onToggle }: HiddenEventItemProps) => {
  const styles = useStylesheet(createStyles);
  const { palettes, dark } = useTheme();
  const { t } = useTranslation();
  const { data: place, isLoading: placeLoading } = useGetPlace(item.room);

  const getLongDayTime = (day: number) => {
    const dayTime = DateTime.now().set({ weekday: day as WeekdayNumbers });
    const dayName = dayTime.toFormat('cccc');
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  };

  return (
    <Row style={styles.card}>
      <Checkbox
        onPress={() => onToggle(item)}
        isChecked={item.restoreVisibility}
        containerStyle={styles.checkbox}
        iconColor={palettes.navy[dark ? '50' : '400']}
      />
      <Col style={styles.cardCol}>
        <Row align="center">
          <Text variant="heading" style={styles.title}>
            {item.type === 'recurrence'
              ? `${getLongDayTime(item.day)}  ${item.start}-${item.end}`
              : `${getLongDayTime(DateTime.fromISO(item.day).weekday)} ${DateTime.fromISO(item.day).setZone('local').toFormat('dd/MM/yyyy')} ${item.start}-${item.end}`}
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

export const HiddenEventsScreen = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { palettes, dark } = useTheme();
  const { t } = useTranslation();
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const coursesQuery = useGetCourses();

  const sections = useMemo((): CourseSection[] => {
    if (!coursesPrefs) return [];

    const courseSections: CourseSection[] = [];

    Object.entries(coursesPrefs).forEach(([shortcode, prefs]) => {
      if (!prefs) return;

      const events: CourseHiddenEvent[] = [];

      if (
        prefs.itemsToHideInAgenda &&
        Array.isArray(prefs.itemsToHideInAgenda)
      ) {
        prefs.itemsToHideInAgenda.forEach(item => {
          events.push({
            type: 'recurrence',
            ...item,
            restoreVisibility: false,
          });
        });
      }

      if (
        prefs.singleItemsToHideInAgenda &&
        Array.isArray(prefs.singleItemsToHideInAgenda)
      ) {
        prefs.singleItemsToHideInAgenda.forEach(item => {
          events.push({
            type: 'single',
            ...item,
            restoreVisibility: false,
          });
        });
      }

      if (events.length > 0) {
        courseSections.push({
          title:
            coursesQuery.data?.find(c => c.uniqueShortcode === shortcode)
              ?.name || shortcode,
          courseShortcode: shortcode,
          data: events,
        });
      }
    });

    return courseSections;
  }, [coursesPrefs, coursesQuery.data]);

  const [selectedItems, setSelectedItems] = useState<
    Map<string, Set<CourseHiddenEvent>>
  >(new Map());

  const [selectAll, setSelectAll] = useState<CheckboxState>(
    CheckboxState.UNSELECTED,
  );

  const totalEventsCount = useMemo(() => {
    return sections.reduce((sum, section) => sum + section.data.length, 0);
  }, [sections]);

  const selectedEventsCount = useMemo(() => {
    let count = 0;
    selectedItems.forEach(set => {
      count += set.size;
    });
    return count;
  }, [selectedItems]);

  useEffect(() => {
    if (selectedEventsCount === 0) {
      setSelectAll(CheckboxState.UNSELECTED);
    } else if (selectedEventsCount === totalEventsCount) {
      setSelectAll(CheckboxState.SELECTED);
    } else {
      setSelectAll(CheckboxState.NOT_ALL_SELECTED);
    }
  }, [selectedEventsCount, totalEventsCount]);

  // Chiudi la schermata se non ci sono più eventi nascosti
  useEffect(() => {
    if (!coursesPrefs) return;

    const hasHiddenEvents = Object.values(coursesPrefs).some(
      prefs =>
        (prefs?.itemsToHideInAgenda && prefs.itemsToHideInAgenda.length > 0) ||
        (prefs?.singleItemsToHideInAgenda &&
          prefs.singleItemsToHideInAgenda.length > 0),
    );

    if (!hasHiddenEvents) {
      requestAnimationFrame(() => {
        navigation.goBack();
      });
    }
  }, [coursesPrefs, navigation]);

  const selectAllItems = () => {
    if (
      selectAll === CheckboxState.SELECTED ||
      selectAll === CheckboxState.NOT_ALL_SELECTED
    ) {
      setSelectedItems(new Map());
    } else {
      const newMap = new Map<string, Set<CourseHiddenEvent>>();
      sections.forEach(section => {
        newMap.set(section.courseShortcode, new Set(section.data));
      });
      setSelectedItems(newMap);
    }
  };

  const handleToggle = (courseShortcode: string, item: CourseHiddenEvent) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const courseSet = newMap.get(courseShortcode) || new Set();

      if (courseSet.has(item)) {
        courseSet.delete(item);
      } else {
        courseSet.add(item);
      }

      if (courseSet.size === 0) {
        newMap.delete(courseShortcode);
      } else {
        newMap.set(courseShortcode, courseSet);
      }

      return newMap;
    });
  };

  const handleRestore = () => {
    if (!coursesPrefs) return;

    const updatedCoursesPrefs = { ...coursesPrefs };

    selectedItems.forEach((items, courseShortcode) => {
      const coursePrefs = coursesPrefs[courseShortcode];
      if (!coursePrefs) return;

      const updatedRecurrences = coursePrefs.itemsToHideInAgenda?.filter(
        recurrence =>
          !Array.from(items).some(
            item =>
              item.type === 'recurrence' &&
              item.start === recurrence.start &&
              item.end === recurrence.end &&
              item.day === recurrence.day &&
              item.room === recurrence.room,
          ),
      );

      const updatedSingles = coursePrefs.singleItemsToHideInAgenda?.filter(
        single =>
          !Array.from(items).some(
            item =>
              item.type === 'single' &&
              item.start === single.start &&
              item.end === single.end &&
              item.day === single.day &&
              item.room === single.room,
          ),
      );

      updatedCoursesPrefs[courseShortcode] = {
        ...coursePrefs,
        itemsToHideInAgenda: updatedRecurrences,
        singleItemsToHideInAgenda: updatedSingles,
      };
    });

    updatePreference('courses', updatedCoursesPrefs);
    setSelectedItems(new Map());
  };

  const hasSelectedItems = Array.from(selectedItems.values()).some(
    set => set.size > 0,
  );

  if (sections.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text variant="heading" style={styles.emptyText}>
          {t('agendaScreen.noHiddenEvents')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SafeAreaView>
          <Checkbox
            onPress={selectAllItems}
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
          {sections.map(section => (
            <View key={section.courseShortcode}>
              <View style={styles.sectionHeader}>
                <Text variant="heading" style={styles.sectionTitle}>
                  {section.title}
                </Text>
              </View>
              <OverviewList>
                {section.data.map((item, index) => {
                  const isSelected =
                    selectedItems.get(section.courseShortcode)?.has(item) ||
                    false;
                  const itemWithSelection = {
                    ...item,
                    restoreVisibility: isSelected,
                  };
                  return (
                    <HiddenEventItem
                      key={`${item.type}-${item.day}-${item.start}-${index}`}
                      item={itemWithSelection}
                      onToggle={() =>
                        handleToggle(section.courseShortcode, item)
                      }
                    />
                  );
                })}
              </OverviewList>
            </View>
          ))}
        </SafeAreaView>
      </ScrollView>
      <CtaButton
        title={t('courseHideEventScreen.button')}
        action={handleRestore}
        disabled={!hasSelectedItems}
      />
      <CtaButtonSpacer />
    </>
  );
};

const createStyles = ({ spacing, fontSizes, palettes, dark }: Theme) =>
  StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[4],
    },
    emptyText: {
      textAlign: 'center',
      color: palettes.navy[dark ? '400' : '600'],
    },
    sectionHeader: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[2],
      paddingBottom: spacing[2],
    },
    sectionTitle: {
      fontSize: fontSizes.md,
      fontWeight: '600',
    },
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
    checkbox: {
      marginHorizontal: 0,
    },
    smallCheckbox: {
      marginHorizontal: spacing[2.5],
      marginTop: spacing[2],
      marginBottom: spacing[1.5],
    },
    textSmallCheckbox: {
      color: palettes.navy[dark ? '50' : '800'],
    },
  });
