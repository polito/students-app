import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import i18n from 'i18next';
import { DateTime } from 'luxon';

interface TimeWidgetProps {
  right?: boolean;
  time: Date;
}

export const TimeWidget = ({ right, time }: TimeWidgetProps) => {
  const createdAt = DateTime.fromJSDate(time);
  const now = DateTime.now();
  const theme = useTheme();
  const locale = i18n.language;
  const { t } = useTranslation();
  const dateIso = createdAt.toISODate();
  const isToday = now.toISODate() === dateIso;
  const isTomorrow = now.plus({ days: 1 }).toISODate() === dateIso;
  const styles = createStyles(theme);

  let timeText = `${createdAt.toFormat('DDD HH:mm', { locale })}`;

  if (isToday) {
    timeText = `${t('common.today')} ${createdAt.toFormat('HH:mm', {
      locale,
    })}`;
  }

  if (isTomorrow) {
    timeText = `${t('common.tomorrow')} ${createdAt.toFormat('HH:mm', {
      locale,
    })}`;
  }

  return (
    <Text style={[styles.hour, right && styles.hourRight]}>{timeText}</Text>
  );
};

const createStyles = ({ spacing, fontWeights, fontSizes, colors }: Theme) =>
  StyleSheet.create({
    hour: {
      marginLeft: spacing[4],
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      textTransform: 'capitalize',
      width: '70%',
      textAlign: 'center',
      fontSize: fontSizes['2xs'],
      color: colors.text['500'],
      fontWeight: fontWeights.normal,
    },
    hourRight: {
      alignSelf: 'flex-end',
      marginRight: spacing[4],
    },
  });
