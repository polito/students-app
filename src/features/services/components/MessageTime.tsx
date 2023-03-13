import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import i18n from 'i18next';
import { DateTime } from 'luxon';

interface TimeWidgetProps {
  right?: boolean;
  time: Date;
}

export const MessageTime = ({ right, time }: TimeWidgetProps) => {
  const createdAt = DateTime.fromJSDate(time);
  const now = DateTime.now();
  const locale = i18n.language;
  const { t } = useTranslation();
  const dateIso = createdAt.toISODate();
  const isToday = now.toISODate() === dateIso;
  const isTomorrow = now.plus({ days: 1 }).toISODate() === dateIso;
  const styles = useStylesheet(createStyles);

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
    <Text variant="caption" style={[styles.hour, right && styles.hourRight]}>
      {timeText || ''}
    </Text>
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    hour: {
      flex: 1,
      width: '70%',
      paddingVertical: spacing[1],
      marginLeft: spacing[4],
      justifyContent: 'center',
      alignItems: 'center',
      textTransform: 'capitalize',
      textAlign: 'center',
      fontSize: fontSizes['2xs'],
      fontWeight: fontWeights.normal,
    },
    hourRight: {
      alignSelf: 'flex-end',
      marginRight: spacing[4],
    },
  });
