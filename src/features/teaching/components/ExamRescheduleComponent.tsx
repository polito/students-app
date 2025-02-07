import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';

type ExamRescheduleProps = {
  firstState: { isError: boolean; value?: string };
  setFirstState: (value: { isError: boolean; value?: string }) => void;
  secondState: { isError: boolean; value?: string };
  setSecondState: (value: { isError: boolean; value?: string }) => void;
};

export const ExamRescheduleComponent = ({
  firstState,
  setFirstState,
  secondState,
  setSecondState,
}: ExamRescheduleProps) => {
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScreenTitle
        style={{ marginVertical: spacing[2] }}
        title={t('examRescheduleScreen.requestReasonTitle')}
      />
      <OverviewList
        style={[styles.searchBar, firstState.isError && styles.searchBarError]}
      >
        <TextField
          label={t('examRescheduleScreen.requestReason')}
          multiline
          numberOfLines={5}
          value={firstState.value}
          onChangeText={value => setFirstState({ isError: false, value })}
          style={GlobalStyles.grow}
          inputStyle={{ borderBottomWidth: 0 }}
          onBlur={() => {
            if (!firstState.value) setFirstState({ isError: true });
          }}
        />
      </OverviewList>
      {firstState.isError && (
        <Text style={styles.errorFeedback}>
          {t('examRescheduleScreen.error')}
        </Text>
      )}
      <ScreenTitle
        style={{ marginVertical: spacing[3] }}
        title={t('examRescheduleScreen.requestDetailsTitle')}
      />
      <OverviewList
        style={[styles.searchBar, secondState.isError && styles.searchBarError]}
      >
        <TextField
          label={t('examRescheduleScreen.requestDetails')}
          multiline
          numberOfLines={5}
          value={secondState.value}
          onChangeText={value => setSecondState({ isError: false, value })}
          style={GlobalStyles.grow}
          inputStyle={{ borderBottomWidth: 0 }}
          onBlur={() => {
            if (!secondState.value) setSecondState({ isError: true });
          }}
        />
      </OverviewList>
      {secondState.isError && (
        <Text style={styles.errorFeedback}>
          {t('examRescheduleScreen.error')}
        </Text>
      )}
      <CtaButtonSpacer />
    </View>
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
      borderRadius: 8,
    },
    searchBarError: {
      borderWidth: 1,
      borderColor: palettes.danger[dark ? 400 : 600],
    },
  });
