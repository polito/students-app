import { PropsWithChildren } from 'react';
import { TextProps } from 'react-native';
import { MixedStyleDeclaration } from 'react-native-render-html';

import { linkUrls } from '../../utils/html';
import { HtmlView } from './HtmlView';

type Props = {
  baseStyle?: MixedStyleDeclaration;
  isCta?: boolean;
} & PropsWithChildren<TextProps>;

export const TextWithLinks = ({
  baseStyle,
  children,
  style,
  isCta = false,
}: Props) => {
  if (!children || typeof children !== 'string') return null;
  const html = linkUrls(children);
  return (
    <HtmlView
      props={{
        source: { html },
        baseStyle: { padding: 0, ...baseStyle },
        defaultTextProps: { style },
      }}
      variant={isCta === true ? 'cta' : 'longProse'}
    />
  );
};
