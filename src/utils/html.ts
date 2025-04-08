import { Document } from 'react-native-render-html';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';
import i18next from 'i18next';

export const sanitizeHtml = (html: string) =>
  html.replace(/\r/g, '').replace(/\\r/g, '').replace(/\\"/g, '"').trim();

export const getHtmlTextContent = (text: string) => {
  const dom = parseDocument(sanitizeHtml(text ?? '')) as Document;
  return innerText(dom.children as any[]);
};

export const replaceImgWithAnchorTags = (html: string) => {
  const imgRegex = /<img[^>]*src="([^">]*)"[^>]*>/gi;
  return html.replace(imgRegex, (_, src) => {
    return `<a href="${src}">${i18next.t('common.image')}</a>`;
  });
};

export const linkUrls = (html: string) => {
  const regex =
    /(?!<a[^>]*>[^<])(?:https?:\/\/(?:www\.)?|www\.)?(?:[A-Z0-9-]+(?:[-.][A-Z0-9]+)*\.[A-Z]{2,5})(?::[0-9]{1,5})?(?:\/[A-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?(?:\?[A-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?(?:#[A-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?(?![^<]*<\/a>)(?<!\.)/gi;
  return html.replace(regex, match => {
    if (!match.startsWith('http')) match = `https://${match}`;
    return `<a href="${match}">${match}</a>`;
  });
};
