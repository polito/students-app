import { extension, lookup } from 'react-native-mime-types';

import { BASE_PATH } from '@polito/api-client';

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
 * Costruisce il filePath per il download di un file del corso
 */
export const buildCourseFilePath = (
  courseFilesCache: string,
  location: string | null | undefined,
  fileId: string,
  fileName: string,
  mimeType?: string | null,
): string => {
  const [filename] = splitNameAndExtension(fileName);
  const ext = getFileExtension(mimeType, fileName);
  const filenameWithId = filename ? `${filename} (${fileId})` : fileId;

  return [
    courseFilesCache,
    location?.replace(/^\//, ''),
    [filenameWithId, ext].filter(Boolean).join('.'),
  ]
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
