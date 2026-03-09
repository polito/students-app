import { extension, lookup } from 'react-native-mime-types';

import { BASE_PATH } from '@polito/api-client';

import { makeDirectoryAsync } from '../core/storage/fileSystem';

/**
 * Create directory and all parent directories (mkdir -p).
 * Uses centralized file system makeDirectoryAsync with intermediates option.
 */
export const mkdirRecursive = async (
  dirPath: string,
  _options?: { NSURLIsExcludedFromBackupKey?: boolean },
): Promise<void> => {
  const normalized = dirPath.replace(/\/+$/, '') || dirPath;
  if (!normalized) return;
  await makeDirectoryAsync(normalized, { intermediates: true });
};

/** Returns the directory name of a path (like path.dirname). */
export const dirname = (path: string): string =>
  path.replace(/\/[^/]*$/, '') || path;

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
 * Strips the " (number)" suffix from file or folder name (e.g. "name (123).pdf" → "name.pdf").
 * Replaces ":" with "_" (invalid on many filesystems). Used for paths and DB.
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
 * Applies stripIdInParentheses to each segment of a path (folder names).
 */
export const stripIdFromPathSegments = (path: string): string => {
  if (!path.trim()) return path;
  return path.split('/').filter(Boolean).map(stripIdInParentheses).join('/');
};

/**
 * Gets the file extension from mimeType or from the file name.
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
 * Builds the file path for a course file download.
 * Preserves the base name when the filename has no extension (e.g. "README" → "README (fileId).txt").
 * Uses fileId in parentheses when the name has no extension to avoid overwrites.
 * Strips any " (number)" from file name and path segments.
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
  let nameForPath: string;
  if (filenamePart) {
    nameForPath = [filenamePart, ext].filter(Boolean).join('.');
  } else if (cleanFileName) {
    // No extension in name (e.g. "README"): preserve base name and add fileId for uniqueness
    nameForPath = ext
      ? `${cleanFileName} (${fileId}).${ext}`
      : `${cleanFileName} (${fileId})`;
  } else {
    nameForPath = ext ? `${fileId}.${ext}` : fileId;
  }

  const cleanLocation = location
    ? stripIdFromPathSegments(location.replace(/^\//, ''))
    : '';

  return [courseFilesCache, cleanLocation, nameForPath]
    .filter(Boolean)
    .join('/');
};

/**
 * Builds the download URL for a course file.
 */
export const buildCourseFileUrl = (
  courseId: number,
  fileId: string,
): string => {
  return `${BASE_PATH}/courses/${courseId}/files/${fileId}`;
};
