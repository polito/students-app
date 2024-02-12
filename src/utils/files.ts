import { ReadDirItem, readDir } from 'react-native-fs';

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
    const children = await readDir(path);
    for (const child of children) {
      if (child.isFile()) {
        files.push(child);
      } else {
        await visitNode(child.path);
      }
    }
  };
  await visitNode(rootPath);
  return files;
};
