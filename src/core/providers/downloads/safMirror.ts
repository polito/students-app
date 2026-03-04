import { Platform } from 'react-native';
import { exists, mkdir, stat, unlink } from 'react-native-fs';
import { dirname } from 'react-native-path';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as FileSystem from 'expo-file-system';

import { PUBLIC_APP_DIRECTORY_PATH } from '../../constants';
import {
  copyFileFromSafDirectory,
  copyFileToSafDirectory,
  deleteFileFromSafDirectory,
  fileExistsInSafDirectory,
  getSafContentUriForFile,
} from './safStorage';

export const getCustomStoragePrefs = async (): Promise<{
  uri: string;
  displayPath: string;
} | null> => {
  if (Platform.OS !== 'android') return null;
  try {
    const location = await AsyncStorage.getItem('fileStorageLocation');
    const uri = await AsyncStorage.getItem('customStoragePath');
    const displayPath = await AsyncStorage.getItem('customStorageDisplayPath');
    if (location === 'custom' && uri && displayPath) {
      return { uri, displayPath };
    }
    return null;
  } catch {
    return null;
  }
};

const normalizePath = (path: string): string =>
  path
    .replace(/^file:\/\//, '')
    .replace(/\/+/g, '/')
    .trim();

const ensureTrailingSlash = (path: string): string =>
  path.endsWith('/') ? path : path + '/';

const getRelativePathAndFilename = (
  fullPath: string,
  basePath?: string,
): { relativePath: string; filename: string } => {
  const baseRaw = normalizePath(basePath ?? PUBLIC_APP_DIRECTORY_PATH);
  const base = ensureTrailingSlash(baseRaw);
  const full = normalizePath(fullPath);
  const fullWithSlash = full + (full.endsWith('/') ? '' : '/');
  if (!full.startsWith(base) && !fullWithSlash.startsWith(base)) {
    const idx = full.indexOf(baseRaw);
    if (idx === 0 && baseRaw.length > 0) {
      const afterBase = full.slice(baseRaw.length).replace(/^\/+/, '');
      const parts = afterBase.split('/').filter(Boolean);
      const filename = parts.pop() || '';
      const relativePath = parts.join('/');
      return { relativePath, filename };
    }
    const filename = fullPath.split('/').filter(Boolean).pop() || '';
    return { relativePath: '', filename };
  }
  const afterBase = full.slice(baseRaw.length).replace(/^\/+/, '');
  const parts = afterBase.split('/').filter(Boolean);
  const filename = parts.pop() || '';
  const relativePath = parts.join('/');
  return { relativePath, filename };
};

const buildDisplayPath = (
  displayBasePath: string,
  relativePath: string,
  filename: string,
): string =>
  [displayBasePath, relativePath, filename].filter(Boolean).join('/');

const buildInternalPath = (relativePath: string, filename: string): string =>
  [PUBLIC_APP_DIRECTORY_PATH, relativePath, filename].filter(Boolean).join('/');

let safMoveQueue: Promise<unknown> = Promise.resolve();

export const moveToSafAfterDownload = async (
  localPath: string,
  mimeType: string = 'application/octet-stream',
): Promise<string | null> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) return null;

  const doMove = async (): Promise<string | null> => {
    const { relativePath, filename } = getRelativePathAndFilename(localPath);
    const ok = await copyFileToSafDirectory(
      localPath,
      prefs.uri,
      relativePath,
      filename,
      mimeType,
    );
    if (!ok) return null;
    await unlink(localPath).catch(() => {});
    return buildDisplayPath(prefs.displayPath, relativePath, filename);
  };

  const prev = safMoveQueue;
  let resolveThis!: (v: string | null) => void;
  const promise = new Promise<string | null>(r => {
    resolveThis = r;
  });
  safMoveQueue = prev
    .then(() => doMove())
    .then(
      result => {
        resolveThis(result ?? null);
        return result;
      },
      e => {
        console.error('SAF move error:', e);
        resolveThis(null);
        return null;
      },
    );
  return promise;
};

export const fileExistsSafAware = async (
  filePath: string,
): Promise<boolean> => {
  const localExists = await exists(filePath);
  if (localExists) return true;

  const prefs = await getCustomStoragePrefs();
  if (!prefs) return false;

  const { relativePath, filename } = getRelativePathAndFilename(filePath);
  return fileExistsInSafDirectory(prefs.uri, relativePath, filename);
};

export const getFileSizeSafAware = async (
  filePath: string,
): Promise<number | null> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const ok = await exists(filePath);
    if (!ok) return null;
    try {
      const info = await stat(filePath);
      return info.size ?? null;
    } catch {
      return null;
    }
  }
  const { relativePath, filename } = getRelativePathAndFilename(filePath);
  const safUri = await getSafContentUriForFile(
    prefs.uri,
    relativePath,
    filename,
  );
  if (!safUri) return null;
  try {
    const info = await FileSystem.getInfoAsync(safUri, { size: true });
    if (!info.exists || !('size' in info)) return null;
    return info.size ?? null;
  } catch {
    return null;
  }
};

export const ensureFileLocal = async (filePath: string): Promise<string> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const localExists = await exists(filePath);
    if (localExists) return filePath;
    throw new Error(`File not found: ${filePath}`);
  }
  const { relativePath, filename } = getRelativePathAndFilename(filePath);
  const internalPath = buildInternalPath(relativePath, filename);
  const cached = await exists(internalPath);
  if (cached) return internalPath;
  await mkdir(dirname(internalPath)).catch(() => {});
  const ok = await copyFileFromSafDirectory(
    prefs.uri,
    relativePath,
    filename,
    internalPath,
  );
  if (!ok) throw new Error(`File not found: ${filePath}`);
  return internalPath;
};

export const getUriForOpening = async (filePath: string): Promise<string> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const localExists = await exists(filePath);
    if (localExists) return filePath;
    throw new Error(`File not found: ${filePath}`);
  }
  const { relativePath, filename } = getRelativePathAndFilename(filePath);
  const contentUri = await getSafContentUriForFile(
    prefs.uri,
    relativePath,
    filename,
  );
  if (!contentUri) throw new Error(`File not found in storage: ${filePath}`);
  return contentUri;
};

export const cleanupLocalCopy = async (localPath: string): Promise<void> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) return;
  await unlink(localPath).catch(() => {});
};

export const removeFileSafAware = async (filePath: string): Promise<void> => {
  await unlink(filePath).catch(() => {});

  const prefs = await getCustomStoragePrefs();
  if (!prefs) return;

  const full = normalizePath(filePath);
  const basePath = full.startsWith(normalizePath(PUBLIC_APP_DIRECTORY_PATH))
    ? PUBLIC_APP_DIRECTORY_PATH
    : prefs.displayPath;
  const { relativePath, filename } = getRelativePathAndFilename(
    filePath,
    basePath,
  );
  await deleteFileFromSafDirectory(prefs.uri, relativePath, filename).catch(
    () => {},
  );
};
