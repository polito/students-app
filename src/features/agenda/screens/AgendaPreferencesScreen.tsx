import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faCalendar, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon.tsx';
import { ListItem } from '@lib/ui/components/ListItem.tsx';
import { OverviewList } from '@lib/ui/components/OverviewList.tsx';
import { RefreshControl } from '@lib/ui/components/RefreshControl.tsx';
import { Section } from '@lib/ui/components/Section.tsx';
import { SectionHeader } from '@lib/ui/components/SectionHeader.tsx';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem.tsx';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '~/core/components/BottomBarSpacer.tsx';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';
import { useGetCourses } from '~/core/queries/courseHooks.ts';
import { AgendaStackParamList } from '~/features/agenda/components/AgendaNavigator.tsx';
import { CourseIndicator } from '~/features/courses/components/CourseIndicator.tsx';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaPreferences'>;

export const AgendaPreferencesScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const coursesQuery = useGetCourses();
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();
  const { spacing, fontSizes } = useTheme();

  const hasHiddenEvents =
    coursesPrefs &&
    Object.values(coursesPrefs).some(
      prefs =>
        (prefs?.itemsToHideInAgenda && prefs.itemsToHideInAgenda.length > 0) ||
        (prefs?.singleItemsToHideInAgenda &&
          prefs.singleItemsToHideInAgenda.length > 0),
    );

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingVertical: spacing[5],
        }}
        refreshControl={<RefreshControl queries={[coursesQuery]} manual />}
      >
        {coursesQuery.data &&
          (coursesQuery.data.length > 0 ? (
            <Section>
              <SectionHeader title={t('AgendaPreferences.showInAgenda')} />
              <OverviewList indented>
                {coursesQuery.data.map(
                  course =>
                    coursesPrefs[course.uniqueShortcode] && (
                      <SwitchListItem
                        key={course.shortcode + '' + course.id}
                        title={course.name}
                        disabled={!coursesPrefs[course.uniqueShortcode]}
                        value={
                          !coursesPrefs[course.uniqueShortcode]
                            .isHiddenInAgenda &&
                          !coursesPrefs[course.uniqueShortcode].isHidden
                        }
                        leadingItem={
                          <CourseIndicator
                            uniqueShortcode={course.uniqueShortcode}
                          />
                        }
                        onChange={value => {
                          updatePreference('courses', {
                            ...coursesPrefs,
                            [course.uniqueShortcode]: {
                              ...coursesPrefs[course.uniqueShortcode],
                              isHiddenInAgenda: !value,
                            },
                          });
                        }}
                      />
                    ),
                )}
              </OverviewList>
            </Section>
          ) : (
            <OverviewList emptyStateText={t('coursesScreen.emptyState')} />
          ))}
        <Section>
          <OverviewList>
            <ListItem
              title={t('common.hiddenEvents')}
              isAction
              onPress={() => {
                navigation.navigate('HiddenEvents');
              }}
              disabled={!hasHiddenEvents}
              trailingItem={<Icon icon={faChevronRight} size={fontSizes.xl} />}
              leadingItem={<Icon icon={faCalendar} size={fontSizes['2xl']} />}
            />
          </OverviewList>
        </Section>
      </ScrollView>
      <BottomBarSpacer />
    </>
  );
};
