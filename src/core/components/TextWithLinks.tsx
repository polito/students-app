import { PropsWithChildren } from 'react';
import { TextProps } from 'react-native';
import { MixedStyleDeclaration } from 'react-native-render-html';

import { linkUrls } from '../../utils/html';
import { HtmlView } from './HtmlView';

type Props = {
  baseStyle?: MixedStyleDeclaration;
} & PropsWithChildren<TextProps>;

export const TextWithLinks = ({ baseStyle, children, style }: Props) => {
  if (!children || typeof children !== 'string') return null;
  const html = linkUrls(children);
  return (
    <HtmlView
      source={{ html }}
      baseStyle={{ padding: 0, ...baseStyle }}
      defaultTextProps={{ style: style }}
    />
  );
};
