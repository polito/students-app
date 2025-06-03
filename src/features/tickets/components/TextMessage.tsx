import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { TextWithLinks } from '../../../../src/core/components/TextWithLinks';
import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { sanitizeHtml } from '../../../utils/html';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const styles = useStylesheet(createStyles);
  const [styless, setStyless] = useState(styles);
  const { accessibility } = usePreferencesContext();
  const { fontSizes } = useTheme();
  const textMessage = useMemo(() => {
    return sanitizeHtml(message ?? '');
  }, [message]);

  useEffect(() => {
    const changeStyle = () => {
      setStyless(prevStyles => ({
        text: {
          ...prevStyles.text,
          lineHeight: accessibility?.lineHeight
            ? fontSizes.sm * 1.5
            : undefined,
          marginBottom: accessibility?.paragraphSpacing ? fontSizes.sm * 2 : 0,
        },
      }));
    };
    changeStyle();
  }, [accessibility, fontSizes]);
  return <TextWithLinks style={styless.text}>{textMessage}</TextWithLinks>;
};

const createStyles = ({ fontSizes, colors }: Theme) => {
  return StyleSheet.create({
    text: {
      fontSize: fontSizes.sm,
      color: colors.white,
      textDecorationColor: colors.white,
      justifyContent: 'center',
    },
  });
};
