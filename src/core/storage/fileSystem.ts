/**
 * Centralized file system and download API. Single place that wraps react-native-fs.
 * Use this module instead of importing react-native-fs directly for:
 * - Paths: documentDirectory, cacheDirectory, externalDirectory
 * - getInfo, pathExists, readDirectory, readDirectoryWithInfo
 * - makeDirectory, copy, delete
 * - readAsString, writeAsString (Base64)
 * - calculateFileChecksum (SHA1)
 * - createResumableDownload (HTTP download to local path)
 *
 * SAF uses react-native-saf-x in saf.ts.
 */
import RNFS from 'react-native-fs';

// --- Directories (used by constants and ticketHooks) ---
// Normalize: no trailing slash so path joins never produce double slashes.

const _documentDirectory = RNFS.DocumentDirectoryPath ?? '';
const _cacheDirectory = RNFS.CachesDirectoryPath ?? '';
/** Android: app-specific external dir (e.g. /storage/emulated/0/Android/data/<pkg>/files). iOS: may match document. */
const _externalDirectory = RNFS.ExternalDirectoryPath ?? '';

export const documentDirectory =
  _documentDirectory.replace(/\/+$/, '') || _documentDirectory;
export const cacheDirectory =
  _cacheDirectory.replace(/\/+$/, '') || _cacheDirectory;
/** On Android this is typically Android/data/<package>/files; use as app "internal" storage root for course files. */
export const externalDirectory =
  _externalDirectory.replace(/\/+$/, '') || _externalDirectory;

// --- Info & existence ---

export interface FileInfo {
  exists: boolean;
  isDirectory: boolean;
  size?: number;
  uri?: string;
}

export async function getInfoAsync(
  path: string,
  options?: { size?: boolean },
): Promise<FileInfo> {
  try {
    const stat = await RNFS.stat(path);
    const isDirectory = stat.isDirectory?.() ?? false;
    return {
      exists: true,
      isDirectory,
      size: options?.size && 'size' in stat ? (stat.size as number) : undefined,
      uri: path,
    };
  } catch {
    return { exists: false, isDirectory: false, uri: path };
  }
}

export async function pathExists(path: string): Promise<boolean> {
  return RNFS.exists(path);
}

// --- Directory listing ---

export async function readDirectoryAsync(path: string): Promise<string[]> {
  const items = await RNFS.readDir(path);
  return items.map(item => item.name);
}

export interface DirEntry {
  path: string;
  name: string;
  isDirectory: boolean;
}

/**
 * List directory with existence and type for each entry.
 */
export async function readDirectoryWithInfo(
  dirPath: string,
): Promise<DirEntry[]> {
  try {
    const items = await RNFS.readDir(dirPath);
    return items.map(item => ({
      path: item.path,
      name: item.name,
      isDirectory: item.isDirectory?.() ?? false,
    }));
  } catch {
    return [];
  }
}

// --- Create directory ---

export async function makeDirectoryAsync(
  path: string,
  _options?: { intermediates?: boolean },
): Promise<void> {
  await RNFS.mkdir(path, {
    NSURLIsExcludedFromBackupKey: false,
  });
}

// --- Copy & delete ---

export async function copyAsync(from: string, to: string): Promise<void> {
  await RNFS.copyFile(from, to);
}

export async function deleteAsync(
  path: string,
  options?: { ignoreNotFound?: boolean },
): Promise<void> {
  try {
    await RNFS.unlink(path);
  } catch (e) {
    if (!options?.ignoreNotFound) throw e;
  }
}

// --- Read/write as string (e.g. Base64 for SAF fallback) ---

export const EncodingType = {
  Base64: 'base64' as const,
  UTF8: 'utf8' as const,
};

export async function readAsStringAsync(
  path: string,
  options: { encoding: 'base64' | 'utf8' },
): Promise<string> {
  return RNFS.readFile(path, options.encoding);
}

export async function writeAsStringAsync(
  path: string,
  content: string,
  options: { encoding: 'base64' | 'utf8' },
): Promise<void> {
  await RNFS.writeFile(path, content, options.encoding);
}

/** SHA1 checksum for a file; used after download and for syncing local files to DB. */
export async function calculateFileChecksum(
  filePath: string,
  expectedSize?: number,
): Promise<string> {
  let fileSize: number | undefined;
  try {
    const stat = await RNFS.stat(filePath);
    if (!stat) throw new Error('File does not exist');
    const size = 'size' in stat ? (stat.size as number) : 0;
    fileSize = size;
    if (size === 0) throw new Error('File is empty');
    if (expectedSize != null && size !== expectedSize)
      throw new Error('File size mismatch');
    const checksum = await RNFS.hash(filePath, 'sha1');
    return checksum;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fileSizeInfo =
      fileSize != null ? ` (${Math.round(fileSize / 1024 / 1024)}MB)` : '';
    console.error(
      `Checksum calculation error for file ${filePath}${fileSizeInfo}:`,
      errorMessage,
    );
    return 'checksum_error';
  }
}

// --- HTTP download (react-native-fs downloadFile) ---

export interface DownloadResumable {
  downloadAsync(): Promise<{ status: number }>;
  cancelAsync(): Promise<void>;
}

/** Progress data passed to the progress callback. */
export interface DownloadProgressData {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export function createResumableDownload(
  uri: string,
  fileUri: string,
  options?: { headers?: Record<string, string> },
  callback?: (progress: DownloadProgressData) => void,
  _resumeData?: string | null,
): DownloadResumable {
  let jobId: number | null = null;

  return {
    async downloadAsync(): Promise<{ status: number }> {
      const { promise } = RNFS.downloadFile({
        fromUrl: uri,
        toFile: fileUri,
        headers: options?.headers,
        begin: res => {
          jobId = res.jobId;
        },
        progress: res => {
          callback?.({
            totalBytesWritten: res.bytesWritten,
            totalBytesExpectedToWrite: res.contentLength,
          });
        },
      });
      const result = await promise;
      return { status: result.statusCode };
    },
    async cancelAsync(): Promise<void> {
      if (jobId != null) {
        RNFS.stopDownload(jobId);
        jobId = null;
      }
    },
  };
}
