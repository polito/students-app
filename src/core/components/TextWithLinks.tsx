import { PropsWithChildren } from 'react';
import { TextProps } from 'react-native';

import { linkUrls } from '../../utils/html';
import { HtmlView } from './HtmlView';

export const TextWithLinks = ({
  children,
  style,
}: PropsWithChildren<TextProps>) => {
  if (!children || typeof children !== 'string') return null;

  const html = linkUrls(children);
  return (
    <HtmlView
      source={{ html }}
      baseStyle={{ padding: 0 }}
      defaultTextProps={{ style: style }}
    />
  );
};
