import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { TextWithLinks } from '../../../core/components/TextWithLinks';
import { getHtmlTextContent } from '../../../utils/html';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const styles = useStylesheet(createStyles);

  const textMessage = useMemo(() => {
    return getHtmlTextContent(message);
  }, [message]);

  return <TextWithLinks style={styles.text}>{textMessage}</TextWithLinks>;
};

const createStyles = ({ fontSizes, colors }: Theme) =>
  StyleSheet.create({
    text: {
      fontSize: fontSizes.sm,
      color: colors.white,
      textDecorationColor: colors.white,
      justifyContent: 'center',
    },
  });
