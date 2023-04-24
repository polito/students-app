import { useMemo } from 'react';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { getHtmlTextContent } from '../../../utils/html';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const { fontSizes } = useTheme();
  const textMessage = useMemo(() => {
    return getHtmlTextContent(message);
  }, [message]);

  return (
    <Text
      // eslint-disable-next-line react-native/no-color-literals
      style={{
        fontSize: fontSizes.sm,
        color: 'white',
        justifyContent: 'center',
      }}
    >
      {textMessage}
    </Text>
  );
};
