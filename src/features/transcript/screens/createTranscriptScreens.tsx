/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { titlesStyles } from '@core/hooks/titlesStyles';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { Transcript } from './Transcript';

export type TranscriptStackParamList = {
  Transcript: undefined;
};

export const createTranscriptScreens = <T extends TranscriptStackParamList>({
  Stack,
}: {
  Stack: ReturnType<typeof createNativeStackNavigator<T>>;
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Group
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Transcript"
        component={Transcript}
        options={{
          headerTitle: t('common.transcript'),
        }}
      />
    </Stack.Group>
  );
};
