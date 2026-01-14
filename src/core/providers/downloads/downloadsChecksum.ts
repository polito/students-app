/**
 * File checksum calculation: computes SHA1 checksums for downloaded files.
 */
import ReactNativeBlobUtil from 'react-native-blob-util';
import { exists, stat } from 'react-native-fs';

export const calculateFileChecksum = async (
  filePath: string,
  expectedSize?: number,
): Promise<string> => {
  let fileStats: any = null;
  try {
    if (!(await exists(filePath))) throw new Error('File does not exist');
    fileStats = await stat(filePath);
    if (fileStats.size === 0) throw new Error('File is empty');
    if (expectedSize && fileStats.size !== expectedSize)
      throw new Error('File size mismatch');

    const checksum = await ReactNativeBlobUtil.fs.hash(filePath, 'sha1');
    return checksum;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fileSizeInfo = fileStats
      ? ` (${Math.round(fileStats.size / 1024 / 1024)}MB)`
      : '';
    console.error(
      `Checksum calculation error for file ${filePath}${fileSizeInfo}:`,
      errorMessage,
    );
    return 'checksum_error';
  }
};
