import { useMemo } from 'react';
import { MixedStyleDeclaration } from 'react-native-render-html';

import { HtmlView } from '../../../core/components/HtmlView';
import { linkUrls, sanitizeHtml } from '../../../utils/html';

export interface HtmlMessage {
  message: string;
  baseStyle?: MixedStyleDeclaration;
}

export const HtmlMessage = ({ message, baseStyle }: HtmlMessage) => {
  const html = useMemo(() => {
    return linkUrls(sanitizeHtml(message));
  }, [message]);

  return <HtmlView source={{ html }} baseStyle={baseStyle} />;
};
