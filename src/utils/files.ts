import { ReadDirItem, readDir, unlink } from 'react-native-fs';

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
  const [_, name, extension] = filePath?.match(/(.+)\.(.+)$/) ?? [];
  return [name, extension] as [string | null, string | null];
};

/**
 * Returns a flattened list of files in the subtree of rootPath
 */
export const readDirRecursively = async (rootPath: string) => {
  const files: ReadDirItem[] = [];
  const visitNode = async (path: string) => {
    for (const item of await readDir(path)) {
      if (item.isFile()) {
        files.push(item);
      } else {
        await visitNode(item.path);
      }
    }
  };
  await visitNode(rootPath);
  return files;
};

/**
 * Cleans up folders that don't contain at least one file in their subtree
 */
export const cleanupEmptyFolders = async (rootPath: string) => {
  const deleteIfEmpty = async (folderPath: string, skip = false) => {
    for (const item of await readDir(folderPath)) {
      if (item.isDirectory()) {
        await deleteIfEmpty(item.path);
      }
    }
    if (!skip && !(await readDir(folderPath)).length) {
      await unlink(folderPath);
    }
  };
  await deleteIfEmpty(rootPath, true);
};
