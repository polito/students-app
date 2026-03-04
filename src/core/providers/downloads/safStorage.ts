import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import * as FileSystem from 'expo-file-system';

const { StorageAccessFramework } = FileSystem;

const MAX_IN_MEMORY_MB = 25;

async function copyFileToSafUri(
  localPath: string,
  safFileUri: string,
): Promise<void> {
  const localUri = toFileUri(localPath);
  const info = await FileSystem.getInfoAsync(localUri, { size: true });
  const sizeBytes = 'size' in info && info.size != null ? info.size : 0;

  try {
    await ReactNativeBlobUtil.MediaCollection.writeToMediafile(
      safFileUri,
      localPath,
    );
    return;
  } catch {}

  try {
    const ok = await ReactNativeBlobUtil.fs.cp(localPath, safFileUri);
    if (ok) return;
  } catch {}

  if (sizeBytes <= MAX_IN_MEMORY_MB * 1024 * 1024) {
    const content = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(safFileUri, content, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return;
  }

  throw new Error(
    `File too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Max ${MAX_IN_MEMORY_MB}MB for custom storage.`,
  );
}

export interface PickDirectoryResult {
  uri: string;
  displayPath: string;
}

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

function getNameFromSafUri(safUri: string): string {
  try {
    const pathPart = safUri.split('/').pop() ?? '';
    let docId = decodeURIComponent(pathPart);
    const lastSlash = docId.lastIndexOf('/');
    const rawName =
      lastSlash !== -1
        ? docId.slice(lastSlash + 1)
        : docId.includes(':')
          ? docId.slice(docId.indexOf(':') + 1)
          : docId;
    try {
      return decodeURIComponent(rawName);
    } catch {
      return rawName;
    }
  } catch {
    return '';
  }
}

function namesMatch(entryName: string, expected: string): boolean {
  if (entryName === expected) return true;
  try {
    const decoded = decodeURIComponent(entryName);
    if (decoded === expected) return true;
    if (entryName === decodeURIComponent(expected)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

async function getSafFileUri(
  treeUri: string,
  relativePath: string,
  fileName: string,
): Promise<string | null> {
  let currentUri = treeUri;
  const pathParts = relativePath.split('/').filter(Boolean);

  for (const part of pathParts) {
    const safePart = part.replace(/:/g, '_').trim();
    const partTrimmed = part.trim();
    const entries = await StorageAccessFramework.readDirectoryAsync(currentUri);
    const found = entries.find(entryUri => {
      const name = getNameFromSafUri(entryUri).trim();
      return (
        namesMatch(name, safePart) ||
        namesMatch(name, partTrimmed) ||
        name === safePart ||
        name === partTrimmed
      );
    });
    if (!found) return null;
    currentUri = found;
  }

  const safeFileName = fileName.replace(/:/g, '_').trim();
  const rawFileName = fileName.trim();
  const entries = await StorageAccessFramework.readDirectoryAsync(currentUri);
  const fileUri = entries.find(entryUri => {
    const name = getNameFromSafUri(entryUri).trim();
    return (
      namesMatch(name, safeFileName) ||
      namesMatch(name, rawFileName) ||
      name === safeFileName ||
      name === rawFileName
    );
  });
  return fileUri ?? null;
}

export const pickSafDirectory = async (): Promise<PickDirectoryResult> => {
  if (Platform.OS !== 'android') {
    throw new Error('SAF is only available on Android');
  }
  const result =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!result.granted || !result.directoryUri) {
    throw new Error('Directory selection cancelled');
  }
  const displayPath = getDisplayPathFromSafUri(result.directoryUri);
  return { uri: result.directoryUri, displayPath };
};

export const copyFileToSafDirectory = async (
  localPath: string,
  treeUri: string,
  relativePath: string,
  fileName: string,
  _mimeType: string = 'application/octet-stream',
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !treeUri) return false;

  try {
    let parentUri = treeUri;
    const pathParts = relativePath.split('/').filter(Boolean);

    for (const part of pathParts) {
      const safePart = part.replace(/:/g, '_').trim();
      const entriesBefore =
        await StorageAccessFramework.readDirectoryAsync(parentUri);
      const existing = entriesBefore.find(entryUri => {
        const name = getNameFromSafUri(entryUri).trim();
        return (
          namesMatch(name, safePart) ||
          namesMatch(name, part.trim()) ||
          name === safePart ||
          name === part.trim()
        );
      });
      if (existing) {
        parentUri = existing;
      } else {
        parentUri = await StorageAccessFramework.makeDirectoryAsync(
          parentUri,
          safePart,
        );
      }
    }

    const safeFileName = fileName.replace(/:/g, '_').trim();
    const lastDot = safeFileName.lastIndexOf('.');
    const nameWithoutExt =
      lastDot > 0 ? safeFileName.slice(0, lastDot) : safeFileName;

    const existingFileUri = await getSafFileUri(
      treeUri,
      relativePath,
      safeFileName,
    );
    if (existingFileUri) {
      await FileSystem.deleteAsync(existingFileUri, { idempotent: true });
    }

    const fileUri = await StorageAccessFramework.createFileAsync(
      parentUri,
      nameWithoutExt,
      _mimeType,
    );

    await copyFileToSafUri(localPath, fileUri);
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
    const safFileUri = await getSafFileUri(treeUri, relativePath, fileName);
    if (!safFileUri) return false;
    const destUri = toFileUri(localDestPath);
    await FileSystem.copyAsync({ from: safFileUri, to: destUri });
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
    const safFileUri = await getSafFileUri(treeUri, relativePath, fileName);
    if (!safFileUri) return false;
    const info = await FileSystem.getInfoAsync(safFileUri);
    return info.exists;
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
    const safFileUri = await getSafFileUri(treeUri, relativePath, fileName);
    if (!safFileUri) return false;
    await FileSystem.deleteAsync(safFileUri, { idempotent: true });
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
): Promise<string | null> => getSafFileUri(treeUri, relativePath, fileName);
