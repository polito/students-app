/**
 * File checksum calculation: computes SHA1 checksums for downloaded files.
 * Uses native hashing for small files and streaming for large files to optimize performance.
 */
import ReactNativeBlobUtil from 'react-native-blob-util';
import { exists, stat } from 'react-native-fs';

import { sha1 } from '@noble/hashes/legacy.js';

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

    const fileSizeMB = fileStats.size / (1024 * 1024);

    if (fileSizeMB <= 200) {
      try {
        const checksum = await ReactNativeBlobUtil.fs.hash(filePath, 'sha1');
        return checksum;
      } catch (nativeError) {
        console.warn(
          'Native hash failed, using streaming fallback:',
          nativeError,
        );
      }
    }

    if (typeof sha1.create === 'function') {
      const hash = sha1.create();
      const CHUNK_SIZE =
        fileSizeMB > 500
          ? 5 * 1024 * 1024
          : fileSizeMB > 200
            ? 4 * 1024 * 1024
            : 2 * 1024 * 1024;

      return new Promise((resolve, reject) => {
        const stream = ReactNativeBlobUtil.fs.readStream(
          filePath,
          'base64',
          CHUNK_SIZE,
        );

        let hasError = false;
        let readStreamInstance: any = null;

        const cleanup = () => {
          if (readStreamInstance && !hasError) {
            try {
              if (typeof readStreamInstance.close === 'function') {
                readStreamInstance.close();
              }
            } catch (cleanupError) {}
          }
        };

        stream
          .then(readStream => {
            readStreamInstance = readStream;
            readStream.open();

            readStream.onData((chunk: string | number[]) => {
              try {
                let chunkBytes: Uint8Array;
                if (Array.isArray(chunk)) {
                  chunkBytes = new Uint8Array(chunk);
                } else {
                  const binaryString = atob(chunk);
                  const len = binaryString.length;
                  chunkBytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    chunkBytes[i] = binaryString.charCodeAt(i);
                  }
                }
                hash.update(chunkBytes);
              } catch (error) {
                if (!hasError) {
                  hasError = true;
                  cleanup();
                  reject(error);
                }
              }
            });

            readStream.onError((error: Error) => {
              if (!hasError) {
                hasError = true;
                cleanup();
                reject(error);
              }
            });

            readStream.onEnd(() => {
              try {
                const digest = hash.digest();
                let checksum = '';
                for (let i = 0; i < digest.length; i++) {
                  const byte = digest[i] as number;
                  checksum += (byte < 16 ? '0' : '') + byte.toString(16);
                }
                cleanup();
                resolve(checksum);
              } catch (error) {
                if (!hasError) {
                  hasError = true;
                  cleanup();
                  reject(error);
                }
              }
            });
          })
          .catch((error: Error) => {
            if (!hasError) {
              hasError = true;
              cleanup();
              reject(error);
            }
          });
      });
    } else {
      throw new Error('SHA1.create() not available');
    }
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
