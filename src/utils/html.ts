import { Document } from 'react-native-render-html';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

export const sanitizeHtml = (html: string) =>
  html.replace(/\r/g, '').replace(/\\r/g, '').replace(/\\"/g, '"').trim();

export const getHtmlTextContent = (text: string) => {
  const dom = parseDocument(sanitizeHtml(text ?? '')) as Document;
  return innerText(dom.children as any[]);
};
