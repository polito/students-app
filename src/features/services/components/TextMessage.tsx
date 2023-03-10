import { useMemo } from 'react';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { parseText } from '../../../utils/html-parse';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const { fontSizes } = useTheme();
  const textMessage = useMemo(() => {
    return parseText(message);
  }, [message]);

  return (
    <Text
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
