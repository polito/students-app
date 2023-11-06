import { Document } from 'react-native-render-html';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

export const sanitizeHtml = (html: string) =>
  html.replace(/\r/g, '').replace(/\\r/g, '').replace(/\\"/g, '"').trim();

export const getHtmlTextContent = (text: string) => {
  const dom = parseDocument(sanitizeHtml(text ?? '')) as Document;
  return innerText(dom.children as any[]);
};

export const linkUrls = (html: string) => {
  const regex =
    /(?:https?:\/\/|www\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/gi;
  return html.replace(regex, match => {
    if (!match.startsWith('http')) match = `https://${match}`;
    return `<a href="${match}">${match}</a>`;
  });
};
