import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { WeekFilter } from '../../agenda/components/WeekFilter';
import { useGetAgendaWeeks } from '../../agenda/queries/agendaHooks';
import { BookingSlotsStatusLegend } from '../components/BookingSlotsStatusLegend';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSlotsSelection'
>;

export const NewBookingSlotsSelectionScreen = ({
  route,
  navigation,
}: Props) => {
  const { topicId } = route.params;
  const { palettes, spacing } = useTheme();
  const { t } = useTranslation();
  const { courses: coursesPreferences } = usePreferencesContext();

  const [currentWeekStart, setCurrentWeekStart] = useState<DateTime>(
    DateTime.now().startOf('week'),
  );

  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  const { data, isFetching, fetchPreviousPage, fetchNextPage, refetch } =
    useGetAgendaWeeks(coursesPreferences);

  const nextWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.plus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (data?.pages[currentPageNumber + 1] !== undefined) {
      setCurrentPageNumber(currentPageNumber + 1);
    } else {
      fetchNextPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber + 1);
      });
    }
  }, [currentPageNumber, currentWeekStart, data?.pages, fetchNextPage]);

  const prevWeek = useCallback(() => {
    const updatedWeek = currentWeekStart.minus({ days: 7 });
    setCurrentWeekStart(updatedWeek);

    if (currentPageNumber > 0) {
      setCurrentPageNumber(currentPageNumber - 1);
    } else {
      fetchPreviousPage({ cancelRefetch: false }).then(() => {
        setCurrentPageNumber(currentPageNumber);
      });
    }
  }, [currentWeekStart, currentPageNumber, fetchPreviousPage]);

  const prevMissingCallback = useCallback(
    () => data?.pages[currentPageNumber - 1] === undefined,
    [data?.pages, currentPageNumber],
  );

  const nextMissingCallback = useCallback(
    () => data?.pages[currentPageNumber + 1] === undefined,
    [data?.pages, currentPageNumber],
  );
  const isOffline = useOfflineDisabled();

  const isPrevWeekDisabled = isOffline ? prevMissingCallback() : isFetching;
  const isNextWeekDisabled = isOffline ? nextMissingCallback() : isFetching;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faRedo}
          color={palettes.primary['500']}
          adjustSpacing="left"
        />
      ),
    });
  }, [navigation, palettes]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <HeaderAccessory justify="space-between" align="center">
        <Tabs>
          <BookingSlotsStatusLegend />
        </Tabs>
        <WeekFilter
          current={currentWeekStart}
          getNext={nextWeek}
          getPrev={prevWeek}
          isNextWeekDisabled={isNextWeekDisabled}
          isPrevWeekDisabled={isPrevWeekDisabled}
        />
      </HeaderAccessory>
    </ScrollView>
  );
};
