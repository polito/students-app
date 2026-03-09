/**
 * App-level storage location: internal vs custom (SAF).
 * Single place for: custom prefs, move-after-download, SAF-aware exists/size/ensureLocal/open/remove.
 */
import { Platform } from 'react-native';
import { lookup } from 'react-native-mime-types';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { dirname, mkdirRecursive } from '../../utils/files';
import { PUBLIC_APP_DIRECTORY_PATH } from '../constants';
import { getFileDatabase } from '../database/FileDatabase';
import {
  cacheDirectory,
  calculateFileChecksum,
  deleteAsync,
  getInfoAsync,
  pathExists,
  readDirectoryWithInfo,
} from './fileSystem';
import {
  copyFileFromSafDirectory,
  copyFileToSafDirectory,
  deleteFileFromSafDirectory,
  fileExistsInSafDirectory,
  getSafContentUriForFile,
} from './saf';

/** Check if a local file/directory exists (no SAF). Use fileExistsInStorage for storage-aware check. */
export const localPathExists = pathExists;

/** Delete a local path (file or directory). Idempotent. */
export const deleteLocalPath = async (path: string): Promise<void> => {
  await deleteAsync(path, { ignoreNotFound: true });
};

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

/**
 * Resolve relativePath and filename from a file path that can be either
 * internal (documentDirectory/...), staging (cache/...), or display path (custom storage).
 * When prefs exist and path starts with displayPath, use that as base so nested folders are correct.
 */
function getRelativePathAndFilenameForStorage(
  filePath: string,
  prefs: { displayPath: string } | null,
): { relativePath: string; filename: string } {
  const full = normalizePath(filePath);
  const docNorm = normalizePath(PUBLIC_APP_DIRECTORY_PATH);
  const cacheNorm = normalizePath(cacheDirectory).replace(/\/+$/, '');

  let basePath: string;
  if (prefs) {
    const displayNorm = normalizePath(prefs.displayPath).replace(/\/+$/, '');
    const isDisplayPath =
      full === displayNorm || full.startsWith(displayNorm + '/');
    const isCachePath = full === cacheNorm || full.startsWith(cacheNorm + '/');
    const isDocPath = full === docNorm || full.startsWith(docNorm + '/');

    if (isDisplayPath) basePath = prefs.displayPath;
    else if (isCachePath) basePath = cacheDirectory;
    else if (isDocPath) basePath = PUBLIC_APP_DIRECTORY_PATH;
    else basePath = prefs.displayPath;
  } else {
    basePath = PUBLIC_APP_DIRECTORY_PATH;
  }
  return getRelativePathAndFilename(filePath, basePath);
}

/** Path to the app Courses root for a user: documentDirectory/username/Courses */
export function getCoursesRootPath(username: string): string {
  return [PUBLIC_APP_DIRECTORY_PATH, username, 'Courses']
    .filter(Boolean)
    .join('/');
}

/**
 * Staging path for downloads when using custom storage (SAF).
 * Files are downloaded here then moved to SAF; avoids creating anything in documentDirectory.
 */
export function getCoursesStagingPath(username: string): string {
  return [cacheDirectory, username, 'Courses'].filter(Boolean).join('/');
}

let safMoveQueue: Promise<unknown> = Promise.resolve();

/**
 * After a download to internal path: if user chose custom storage, copy to SAF and delete internal copy.
 * Returns the display path if moved, null otherwise. Used by DownloadsProvider and useDownloadFile.
 */
export const moveDownloadToCustomStorage = async (
  localPath: string,
  mimeType: string = 'application/octet-stream',
): Promise<string | null> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) return null;

  const doMove = async (): Promise<string | null> => {
    const fullNorm = normalizePath(localPath);
    const cacheNorm = normalizePath(cacheDirectory).replace(/\/+$/, '');
    const isStagingPath =
      fullNorm === cacheNorm || fullNorm.startsWith(cacheNorm + '/');
    const basePath = isStagingPath ? cacheDirectory : PUBLIC_APP_DIRECTORY_PATH;
    const { relativePath, filename } = getRelativePathAndFilename(
      localPath,
      basePath,
    );
    const ok = await copyFileToSafDirectory(
      localPath,
      prefs.uri,
      relativePath,
      filename,
      mimeType,
    );
    if (!ok) return null;
    await deleteAsync(localPath, { ignoreNotFound: true });
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

/**
 * Persist a downloaded file to the file DB and optionally move to custom storage (SAF).
 * Single place for post-download: getInfo, checksum, insertFile, moveDownloadToCustomStorage, updateFile.
 * Returns { checksum } so callers can e.g. verify against API checksum.
 */
export async function persistDownloadedFileToDb(
  localPath: string,
  params: { id: string; ctx: string; ctxId: string },
): Promise<{ checksum: string }> {
  const fileDatabase = getFileDatabase();
  const info = await getInfoAsync(localPath, { size: true });
  const size = info.exists && 'size' in info ? (info.size ?? 0) : 0;
  const filename = localPath.split('/').pop() || '';
  const ext = filename.split('.').pop() || '';
  const mime = lookup(ext) || 'application/octet-stream';
  let checksum = 'checksum_error';
  try {
    checksum = await calculateFileChecksum(localPath, size);
  } catch (e) {
    console.warn('Could not calculate checksum, using placeholder:', e);
  }
  await fileDatabase.insertFile({
    id: params.id,
    ctx: params.ctx,
    ctxId: params.ctxId,
    path: localPath,
    filename,
    mime,
    checksum,
    sizeKb: Math.round(size / 1024),
    downloadTime: new Date().toISOString(),
    updateTime: undefined,
  });
  try {
    const safPath = await moveDownloadToCustomStorage(localPath, mime);
    if (safPath) {
      await fileDatabase.updateFile(params.id, { path: safPath });
    }
  } catch (e) {
    console.error('SAF move after download failed:', e);
  }
  return { checksum };
}

export const fileExistsInStorage = async (
  filePath: string,
): Promise<boolean> => {
  const localExists = await pathExists(filePath);
  if (localExists) return true;

  const prefs = await getCustomStoragePrefs();
  if (!prefs) return false;

  const { relativePath, filename } = getRelativePathAndFilenameForStorage(
    filePath,
    prefs,
  );
  return fileExistsInSafDirectory(prefs.uri, relativePath, filename);
};

export const getFileSizeInStorage = async (
  filePath: string,
): Promise<number | null> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const ok = await pathExists(filePath);
    if (!ok) return null;
    try {
      const info = await getInfoAsync(filePath, { size: true });
      if (!info.exists || !('size' in info)) return null;
      return info.size ?? null;
    } catch {
      return null;
    }
  }
  const { relativePath, filename } = getRelativePathAndFilenameForStorage(
    filePath,
    prefs,
  );
  const safUri = await getSafContentUriForFile(
    prefs.uri,
    relativePath,
    filename,
  );
  if (!safUri) return null;
  try {
    const info = await getInfoAsync(safUri, { size: true });
    if (!info.exists || !('size' in info)) return null;
    return info.size ?? null;
  } catch {
    return null;
  }
};

/** Ensure file is on local FS (internal or cached from SAF). Returns local path to open. */
export const ensureFileLocal = async (filePath: string): Promise<string> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const localExists = await pathExists(filePath);
    if (localExists) return filePath;
    throw new Error(`File not found: ${filePath}`);
  }
  const { relativePath, filename } = getRelativePathAndFilenameForStorage(
    filePath,
    prefs,
  );
  const internalPath = buildInternalPath(relativePath, filename);
  const cached = await pathExists(internalPath);
  if (cached) return internalPath;
  await mkdirRecursive(dirname(internalPath)).catch(() => {});
  const ok = await copyFileFromSafDirectory(
    prefs.uri,
    relativePath,
    filename,
    internalPath,
  );
  if (!ok) throw new Error(`File not found: ${filePath}`);
  return internalPath;
};

/** URI to use for opening the file (local path or SAF content URI). */
export const getUriForOpening = async (filePath: string): Promise<string> => {
  const prefs = await getCustomStoragePrefs();
  if (!prefs) {
    const localExists = await pathExists(filePath);
    if (localExists) return filePath;
    throw new Error(`File not found: ${filePath}`);
  }
  const { relativePath, filename } = getRelativePathAndFilenameForStorage(
    filePath,
    prefs,
  );
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
  await deleteAsync(localPath, { ignoreNotFound: true });
};

/** Remove file from both local path and custom storage (SAF) if used. */
export const removeFileFromStorage = async (
  filePath: string,
): Promise<void> => {
  await deleteAsync(filePath, { ignoreNotFound: true });

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

const FILE_ID_REGEX = /\((\d+)\)\.[^.]+$/;
const COURSE_ID_REGEX = /\((\d+)\)$/;

async function syncDir(
  fileDatabase: ReturnType<typeof getFileDatabase>,
  dirPath: string,
  courseId: string,
): Promise<number> {
  let entries: Array<{ path: string; name: string; isDirectory: boolean }>;
  try {
    entries = await readDirectoryWithInfo(dirPath);
  } catch {
    return 0;
  }
  let count = 0;
  for (const entry of entries) {
    if (entry.isDirectory) {
      count += await syncDir(fileDatabase, entry.path, courseId);
      continue;
    }
    const fileIdMatch = entry.name.match(FILE_ID_REGEX);
    if (!fileIdMatch) continue;
    const fileId = fileIdMatch[1];
    try {
      const existing = await fileDatabase.getFileById(fileId);
      if (existing) continue;
      const info = await getInfoAsync(entry.path, { size: true });
      const size = info.exists && 'size' in info ? (info.size ?? 0) : 0;
      const checksum = await calculateFileChecksum(entry.path, size);
      const ext = entry.name.split('.').pop() || 'application/octet-stream';
      await fileDatabase.insertFile({
        id: fileId,
        ctx: 'course',
        ctxId: courseId,
        path: entry.path,
        filename: entry.name,
        mime: ext,
        checksum,
        sizeKb: Math.round(size / 1024),
        downloadTime: new Date().toISOString(),
        updateTime: undefined,
      });
      count++;
    } catch (error) {
      console.error(`Failed to sync file ${entry.path}:`, error);
    }
  }
  return count;
}

/** Scan app documents/Courses and insert missing files into the file DB. Used at app load. */
export async function syncLocalFilesToDb(
  username: string,
  _fileStorageLocation?: 'internal' | 'custom',
): Promise<number> {
  const fileDatabase = getFileDatabase();
  let syncedCount = 0;
  const coursesPath = getCoursesRootPath(username);
  let courseDirs: Array<{ path: string; name: string; isDirectory: boolean }>;
  try {
    courseDirs = await readDirectoryWithInfo(coursesPath);
  } catch {
    return 0;
  }
  for (const courseDir of courseDirs) {
    if (!courseDir.isDirectory) continue;
    const courseIdMatch = courseDir.name.match(COURSE_ID_REGEX);
    if (!courseIdMatch) continue;
    syncedCount += await syncDir(
      fileDatabase,
      courseDir.path,
      courseIdMatch[1],
    );
  }
  return syncedCount;
}
