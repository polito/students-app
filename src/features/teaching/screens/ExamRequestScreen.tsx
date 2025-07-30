import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useBookExam, useGetExams } from '../../../core/queries/examHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'ExamRequest'>;

export const ExamRequestScreen = ({ route, navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const { id } = route.params;
  const examsQuery = useGetExams();
  const exam = examsQuery.data?.find(e => e.id === id);

  const { mutateAsync: bookExam, isPending: isBooking } = useBookExam(id);

  const [state, setState] = useState<{ isError: boolean; value?: string }>({
    isError: false,
    value: undefined,
  });

  const onSubmit = async () => {
    if ((state.value?.length ?? 0) === 0) {
      setState({ ...state, isError: true });
      return;
    }
    bookExam({
      courseShortcode: exam!.courseShortcode,
      requestReason: state.value,
    }).then(() => {
      setFeedback({ text: t('examScreen.ctaBookSuccess') });
      // reset navigation to TeachingScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  };

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SafeAreaView>
          <View style={styles.container}>
            <ScreenTitle
              style={styles.screenTitle}
              title={t('examRequestScreen.title')}
            />
            <OverviewList
              style={[styles.searchBar, state.isError && styles.searchBarError]}
            >
              <TextField
                label={t('examRequestScreen.placeholder')}
                multiline
                numberOfLines={5}
                value={state.value}
                onChangeText={value => setState({ isError: false, value })}
                style={GlobalStyles.grow}
                inputStyle={{ borderBottomWidth: 0 }}
              />
            </OverviewList>
            {state.isError && (
              <Text style={styles.errorFeedback}>
                {t('examRequestScreen.error')}
              </Text>
            )}
          </View>
          <CtaButtonSpacer />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      {exam && (
        <CtaButton
          title={t('common.confirm')}
          action={onSubmit}
          loading={isBooking}
        />
      )}
    </>
  );
};

const createStyles = ({ dark, palettes, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing[5],
    },
    errorFeedback: {
      color: palettes.danger[dark ? 400 : 600],
    },
    screenTitle: {
      marginBottom: spacing[7],
    },
    searchBar: {
      marginHorizontal: 0,
    },
    searchBarError: {
      borderWidth: 1,
      borderColor: palettes.danger[dark ? 400 : 600],
    },
  });
