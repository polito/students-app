import { useMemo } from 'react';
import { Document } from 'react-native-render-html';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

export interface TextMessageProps {
  message: string;
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const { fontSizes } = useTheme();
  const textMessage = useMemo(() => {
    const dom = parseDocument(
      (message ?? '').replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
      // (message ?? '').replace(/<br>/g, '\n').replace(/\\r+/g, '\n'),
    ) as Document;
    return innerText(dom.children as any[]);
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
