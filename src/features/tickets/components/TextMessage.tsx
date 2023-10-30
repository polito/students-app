import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { getHtmlTextContent } from '../../../utils/html';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const styles = useStylesheet(createStyles);

  const textMessage = useMemo(() => {
    return getHtmlTextContent(message);
  }, [message]);

  return <Text style={styles.text}>{textMessage}</Text>;
};

const createStyles = ({ fontSizes, colors }: Theme) =>
  StyleSheet.create({
    text: {
      fontSize: fontSizes.sm,
      color: colors.white,
      justifyContent: 'center',
    },
  });
