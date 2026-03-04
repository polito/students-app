import { exists, mkdir } from 'react-native-fs';
import { extension, lookup } from 'react-native-mime-types';

import { BASE_PATH } from '@polito/api-client';

/**
 * Create directory and all parent directories (mkdir -p).
 * react-native-fs mkdir does not create intermediates.
 */
export const mkdirRecursive = async (
  dirPath: string,
  options?: { NSURLIsExcludedFromBackupKey?: boolean },
): Promise<void> => {
  const parts = dirPath.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length === 0) return;
  let current = dirPath.startsWith('/') ? '' : '.';
  for (const part of parts) {
    current = current ? `${current}/${part}` : `/${part}`;
    if (await exists(current).catch(() => false)) continue;
    await mkdir(current, options).catch(() => {});
  }
};

export const formatFileSize = (
  sizeInKiloBytes: number,
  fractionDigit: number = 2,
) => {
  if (sizeInKiloBytes < 1000) {
    return `${sizeInKiloBytes.toFixed(fractionDigit)} KB`;
  }
  if (sizeInKiloBytes < 1000000) {
    return `${Math.round(sizeInKiloBytes / 1000)} MB`;
  }
  return `${Math.round(sizeInKiloBytes / 1000000)} GB`;
};

export const splitNameAndExtension = (filePath?: string) => {
  const [_, name, fileExtension] = filePath?.match(/(.+)\.(.+)$/) ?? [];
  return [name, fileExtension] as [string | null, string | null];
};

/**
 * Rimuove il suffisso " (numero)" da file o cartella (es. "name (123).pdf" → "name.pdf").
 * Sostituisce ":" con "_" (carattere non valido in path su molti filesystem).
 * Usato per path e DB.
 */
export const stripIdInParentheses = (name: string): string => {
  const lastDot = name.lastIndexOf('.');
  let result: string;
  if (lastDot > 0) {
    const beforeExt = name
      .slice(0, lastDot)
      .replace(/\s*\(\d+\)\s*$/, '')
      .trim();
    const ext = name.slice(lastDot);
    result = beforeExt ? beforeExt + ext : name;
  } else {
    result = name.replace(/\s*\(\d+\)\s*$/, '').trim();
  }
  return result.replace(/:/g, '_');
};

/**
 * Applica stripIdInParentheses a ogni segmento di un path (nomi cartelle).
 */
export const stripIdFromPathSegments = (path: string): string => {
  if (!path.trim()) return path;
  return path.split('/').filter(Boolean).map(stripIdInParentheses).join('/');
};

/**
 * Ottiene l'estensione del file dal mimeType o dal nome del file
 */
export const getFileExtension = (
  mimeType: string | null | undefined,
  fileName: string,
): string | null => {
  let ext: string | null = extension(mimeType ?? '');
  if (!ext) {
    const [, extensionFromName] = splitNameAndExtension(fileName);
    if (extensionFromName && lookup(extensionFromName)) {
      ext = extensionFromName;
    }
  }
  return ext;
};

/**
 * Costruisce il filePath per il download di un file del corso.
 * Non aggiunge l'id tra parentesi al nome; rimuove eventuali " (numero)" da nome file e dai segmenti del path.
 */
export const buildCourseFilePath = (
  courseFilesCache: string,
  location: string | null | undefined,
  fileId: string,
  fileName: string,
  mimeType?: string | null,
): string => {
  const cleanFileName = stripIdInParentheses(fileName);
  const [filenamePart] = splitNameAndExtension(cleanFileName);
  const ext = getFileExtension(mimeType, cleanFileName);
  const nameForPath = filenamePart
    ? [filenamePart, ext].filter(Boolean).join('.')
    : ext
      ? `${fileId}.${ext}`
      : fileId;

  const cleanLocation = location
    ? stripIdFromPathSegments(location.replace(/^\//, ''))
    : '';

  return [courseFilesCache, cleanLocation, nameForPath]
    .filter(Boolean)
    .join('/');
};

/**
 * Costruisce l'URL per il download di un file del corso
 */
export const buildCourseFileUrl = (
  courseId: number,
  fileId: string,
): string => {
  return `${BASE_PATH}/courses/${courseId}/files/${fileId}`;
};
