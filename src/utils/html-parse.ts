import { Document } from 'react-native-render-html';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

export const parseText = (text: string) => {
  const dom = parseDocument(
    (text ?? '').replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
  ) as Document;
  return innerText(dom.children as any[]);
};
