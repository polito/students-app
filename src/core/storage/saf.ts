/**
 * Low-level SAF (Storage Access Framework) API for Android.
 * Single place for: pick directory, copy to/from SAF, exists, delete, get content URI.
 * Uses react-native-saf-x. Local FS use fileSystem.
 */
import { Platform } from 'react-native';
import {
  openDocumentTree,
  copyFile as safCopyFile,
  createFile as safCreateFile,
  exists as safExists,
  mkdir as safMkdir,
  stat as safStat,
  unlink as safUnlink,
} from 'react-native-saf-x';

import { makeDirectoryAsync } from './fileSystem';

function toFileUri(path: string): string {
  const trimmed = path.trim();
  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('asset://')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    try {
      return 'file://' + encodeURI(trimmed);
    } catch {
      return 'file://' + trimmed.replace(/\s/g, '%20');
    }
  }
  return path;
}

function getDisplayPathFromSafUri(uri: string): string {
  try {
    const pathPart = uri.split('/').pop() ?? '';
    const docId = decodeURIComponent(pathPart);
    const colonIndex = docId.indexOf(':');
    if (colonIndex === -1) return uri;
    const scheme = docId.slice(0, colonIndex);
    const rest = docId.slice(colonIndex + 1).replace(/%2F/g, '/');
    const base =
      scheme === 'primary' ? '/storage/emulated/0' : `/storage/${scheme}`;
    try {
      return `${base}/${decodeURIComponent(rest)}`;
    } catch {
      return `${base}/${rest}`;
    }
  } catch {
    return uri;
  }
}

function buildSafPath(
  treeUri: string,
  relativePath: string,
  fileName: string,
): string {
  const parts = [
    treeUri.replace(/\/$/, ''),
    relativePath.replace(/^\/+|\/+$/g, ''),
    fileName,
  ].filter(Boolean);
  return parts.join('/');
}

export interface PickDirectoryResult {
  uri: string;
  displayPath: string;
}

export const pickSafDirectory = async (): Promise<PickDirectoryResult> => {
  if (Platform.OS !== 'android') {
    throw new Error('SAF is only available on Android');
  }
  const doc = await openDocumentTree(true);
  if (!doc?.uri) {
    throw new Error('Directory selection cancelled');
  }
  const displayPath = getDisplayPathFromSafUri(doc.uri);
  return { uri: doc.uri, displayPath };
};

export const copyFileToSafDirectory = async (
  localPath: string,
  treeUri: string,
  relativePath: string,
  fileName: string,
  mimeType: string = 'application/octet-stream',
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !treeUri) return false;

  try {
    const parentPath = [
      treeUri.replace(/\/$/, ''),
      relativePath.replace(/^\/+|\/+$/g, ''),
    ]
      .filter(Boolean)
      .join('/');
    const destPath = buildSafPath(treeUri, relativePath, fileName);

    await safMkdir(parentPath);

    if (await safExists(destPath)) {
      await safUnlink(destPath);
    }

    await safCreateFile(destPath, { mimeType });

    const localUri = toFileUri(localPath);
    await safCopyFile(localUri, destPath, { replaceIfDestinationExists: true });
    return true;
  } catch (error) {
    console.error('copyFileToSafDirectory error:', error);
    return false;
  }
};

export const copyFileFromSafDirectory = async (
  treeUri: string,
  relativePath: string,
  fileName: string,
  localDestPath: string,
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !treeUri) return false;

  try {
    const safPath = buildSafPath(treeUri, relativePath, fileName);
    const destDir = localDestPath.replace(/\/[^/]+$/, '');
    if (destDir) {
      await makeDirectoryAsync(toFileUri(destDir));
    }
    const localUri = toFileUri(localDestPath);
    await safCopyFile(safPath, localUri, { replaceIfDestinationExists: true });
    return true;
  } catch (error) {
    console.error('copyFileFromSafDirectory error:', error);
    return false;
  }
};

export const fileExistsInSafDirectory = async (
  treeUri: string,
  relativePath: string,
  fileName: string,
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !treeUri) return false;
  try {
    const safPath = buildSafPath(treeUri, relativePath, fileName);
    return await safExists(safPath);
  } catch {
    return false;
  }
};

export const deleteFileFromSafDirectory = async (
  treeUri: string,
  relativePath: string,
  fileName: string,
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !treeUri) return false;
  try {
    const safPath = buildSafPath(treeUri, relativePath, fileName);
    if (!(await safExists(safPath))) return false;
    await safUnlink(safPath);
    return true;
  } catch (error) {
    console.error('deleteFileFromSafDirectory error:', error);
    return false;
  }
};

export const getSafContentUriForFile = async (
  treeUri: string,
  relativePath: string,
  fileName: string,
): Promise<string | null> => {
  if (Platform.OS !== 'android' || !treeUri) return null;
  try {
    const safPath = buildSafPath(treeUri, relativePath, fileName);
    if (!(await safExists(safPath))) return null;
    const detail = await safStat(safPath);
    return detail?.uri ?? safPath;
  } catch {
    return null;
  }
};
