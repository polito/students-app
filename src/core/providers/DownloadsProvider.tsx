import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  downloadFile,
  exists,
  stopDownload as fsStopDownload,
  mkdir,
  readFile,
  stat,
} from 'react-native-fs';

import { sha1 } from '@noble/hashes/legacy.js';

import { MAX_CONCURRENT_DOWNLOADS } from '../constants';
import { useApiContext } from '../contexts/ApiContext';
import {
  Download,
  DownloadArea,
  DownloadPhase,
  DownloadQueue,
  DownloadRequest,
  Downloads,
  DownloadsContext,
  QueuedFile,
} from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { FileRecord, getFileDatabase } from '../database/FileDatabase';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const { token } = useApiContext();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const fileDatabase = getFileDatabase();

  const calculateFileChecksum = useCallback(
    async (filePath: string): Promise<string> => {
      try {
        const fileExists = await exists(filePath);
        if (!fileExists) {
          throw new Error(`File does not exist: ${filePath}`);
        }

        const fileContent = await readFile(filePath, 'base64');

        const binaryString = atob(fileContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const hash = sha1(bytes);
        return Array.from(hash)
          .map((b: unknown) => (b as number).toString(16).padStart(2, '0'))
          .join('');
      } catch (error) {
        console.error('Error calculating file checksum:', error);
        return 'checksum_error';
      }
    },
    [],
  );

  const insertFileToSQLite = useCallback(
    async (file: FileRecord) => {
      await fileDatabase.insertFile(file);
    },
    [fileDatabase],
  );

  const [downloads, setDownloads] = useState<Downloads>({});
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueue>({
    files: [],
    isDownloading: false,
    currentFileIndex: 0,
    activeDownloadIds: new Set(),
    overallProgress: 0,
    hasCompleted: false,
    isProcessingFile: false,
    hasFailure: false,
  });

  const downloadQueueRef = useRef(downloadQueue);
  downloadQueueRef.current = downloadQueue;

  const downloadsRef = useRef(downloads);
  downloadsRef.current = downloads;

  const downloadResultsRef = useRef({ successCount: 0, errorCount: 0 });
  const pendingFeedbackRef = useRef<{
    successCount: number;
    errorCount: number;
  } | null>(null);

  const processDownloadQueueRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    downloadsRef.current = downloads;
  }, [downloads]);

  useEffect(() => {
    if (
      pendingFeedbackRef.current &&
      !downloadQueue.isDownloading &&
      downloadQueue.hasCompleted
    ) {
      const { successCount, errorCount } = pendingFeedbackRef.current;

      if (errorCount === 0) {
        setFeedback({
          text: t('common.downloadCompleted'),
          isPersistent: false,
        });
      } else {
        setFeedback({
          text: t('common.downloadCompletedWithErrors', {
            successCount,
            errorCount,
          }),
          isPersistent: false,
        });
      }

      pendingFeedbackRef.current = null;
    }
  }, [downloadQueue.isDownloading, downloadQueue.hasCompleted, setFeedback, t]);

  const downloadSingleFile = useCallback(
    async (file: QueuedFile) => {
      const key = `${file.url}:${file.filePath}`;

      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          downloadProgress: 0,
          phase: DownloadPhase.Downloading,
          error: undefined,
          isDownloaded: false,
        },
      }));

      try {
        const directoryPath = file.filePath.substring(
          0,
          file.filePath.lastIndexOf('/'),
        );
        await mkdir(directoryPath, { NSURLIsExcludedFromBackupKey: true });

        const { jobId, promise } = downloadFile({
          fromUrl: file.url,
          toFile: file.filePath,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          begin: () => {},
          progress: ({ bytesWritten, contentLength }) => {
            const fileProgress = bytesWritten / contentLength;

            setDownloads(prev => ({
              ...prev,
              [key]: {
                ...prev[key],
                downloadProgress: fileProgress,
              },
            }));

            setDownloadQueue(prev => {
              const currentDownloads = downloadsRef.current;
              const totalFiles = prev.files.length;
              const completedFiles = prev.files.filter(
                f =>
                  prev.activeDownloadIds.has(f.id) === false &&
                  currentDownloads[`${f.url}:${f.filePath}`]?.isDownloaded ===
                    true,
              ).length;

              const activeProgresses = prev.files
                .filter(f => prev.activeDownloadIds.has(f.id))
                .map(f => {
                  const fileKey = `${f.url}:${f.filePath}`;
                  return currentDownloads[fileKey]?.downloadProgress ?? 0;
                });

              const activeProgressSum = activeProgresses.reduce(
                (sum, p) => sum + p,
                0,
              );
              const activeCount = activeProgresses.length;

              const overallProgress =
                activeCount > 0
                  ? (completedFiles + activeProgressSum / activeCount) /
                    totalFiles
                  : completedFiles / totalFiles;

              return {
                ...prev,
                currentFileIndex: completedFiles,
                overallProgress: Math.min(overallProgress, 1),
              };
            });
          },
        });

        setDownloads(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            jobId,
          },
        }));

        const result = await promise;
        if (result.statusCode !== 200) {
          throw new Error(t('common.downloadError'));
        }

        setDownloads(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            isDownloaded: true,
            downloadProgress: undefined,
            phase: DownloadPhase.Completed,
            error: undefined,
          },
        }));

        try {
          const fileExists = await exists(file.filePath);
          if (!fileExists) {
            console.warn(
              'File does not exist, skipping SQLite metadata save:',
              file.filePath,
            );
          } else {
            const fileStats = await stat(file.filePath);
            const filename = file.filePath.split('/').pop() || '';
            const mimeType =
              filename.split('.').pop() || 'application/octet-stream';

            let checksum = 'checksum_error';
            try {
              checksum = await calculateFileChecksum(file.filePath);
            } catch (checksumError) {
              console.warn(
                'Could not calculate checksum, using placeholder:',
                checksumError,
              );
            }

            await insertFileToSQLite({
              id: file.id,
              area: `course-${file.contextId}`,
              path: file.filePath,
              filename,
              mime: mimeType,
              checksum,
              sizeKb: Math.round(fileStats.size / 1024),
              downloadTime: new Date().toISOString(),
              updateTime: undefined,
            });
          }
        } catch (error) {
          console.error('Error saving file metadata to SQLite:', error);
        }

        downloadResultsRef.current.successCount++;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setDownloads(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            isDownloaded: false,
            downloadProgress: undefined,
            phase: DownloadPhase.Error,
            error: errorMessage,
          },
        }));

        downloadResultsRef.current.errorCount++;

        setDownloadQueue(prev => ({
          ...prev,
          hasFailure: true,
        }));
      } finally {
        setDownloadQueue(prev => {
          const newActiveIds = new Set(prev.activeDownloadIds);
          newActiveIds.delete(file.id);

          const currentDownloads = downloadsRef.current;
          const completedFiles = prev.files.filter(
            f =>
              !newActiveIds.has(f.id) &&
              currentDownloads[`${f.url}:${f.filePath}`]?.isDownloaded === true,
          ).length;

          const allFilesProcessed = prev.files.every(
            f =>
              newActiveIds.has(f.id) === false &&
              (currentDownloads[`${f.url}:${f.filePath}`]?.isDownloaded ===
                true ||
                currentDownloads[`${f.url}:${f.filePath}`]?.isDownloaded ===
                  false),
          );

          const newState: DownloadQueue =
            allFilesProcessed && newActiveIds.size === 0
              ? {
                  ...prev,
                  isDownloading: false,
                  currentFileIndex: 0,
                  activeDownloadIds: new Set<string>(),
                  overallProgress: 1,
                  hasCompleted: true,
                  files: [],
                  isProcessingFile: false,
                  hasFailure: false,
                }
              : {
                  ...prev,
                  currentFileIndex: completedFiles,
                  activeDownloadIds: newActiveIds,
                  isProcessingFile: newActiveIds.size > 0,
                };

          if (allFilesProcessed && newActiveIds.size === 0) {
            pendingFeedbackRef.current = { ...downloadResultsRef.current };
          }

          downloadQueueRef.current = newState as DownloadQueue;

          setTimeout(() => {
            processDownloadQueueRef.current?.();
          }, 0);

          return newState;
        });
      }
    },
    [
      token,
      t,
      setDownloads,
      setDownloadQueue,
      insertFileToSQLite,
      calculateFileChecksum,
    ],
  );

  const processDownloadQueue = useCallback(() => {
    const currentQueue = downloadQueueRef.current;
    const currentDownloads = downloadsRef.current;

    if (!currentQueue.isDownloading) {
      return;
    }

    const pendingFiles = currentQueue.files.filter(
      file =>
        !currentQueue.activeDownloadIds.has(file.id) &&
        !currentDownloads[`${file.url}:${file.filePath}`]?.isDownloaded,
    );

    if (
      pendingFiles.length === 0 &&
      currentQueue.activeDownloadIds.size === 0
    ) {
      setDownloadQueue(prev => {
        pendingFeedbackRef.current = { ...downloadResultsRef.current };

        return {
          ...prev,
          isDownloading: false,
          currentFileIndex: 0,
          activeDownloadIds: new Set(),
          overallProgress: 1,
          hasCompleted: true,
          files: [],
          isProcessingFile: false,
          hasFailure: false,
        };
      });
      return;
    }

    const availableSlots =
      MAX_CONCURRENT_DOWNLOADS - currentQueue.activeDownloadIds.size;
    const filesToStart = pendingFiles.slice(0, availableSlots);

    if (filesToStart.length > 0) {
      setDownloadQueue(prev => {
        const newActiveIds = new Set(prev.activeDownloadIds);
        filesToStart.forEach(file => newActiveIds.add(file.id));

        return {
          ...prev,
          activeDownloadIds: newActiveIds,
          isProcessingFile: true,
        };
      });

      filesToStart.forEach(file => {
        downloadSingleFile(file);
      });
    }
  }, [downloadSingleFile]);

  processDownloadQueueRef.current = processDownloadQueue;

  const addToQueue = useCallback((file: QueuedFile) => {
    setDownloadQueue(prev => {
      if (prev.isDownloading) {
        return prev;
      }
      return {
        ...prev,
        files: [...prev.files.filter(f => f.id !== file.id), file],
      };
    });
  }, []);

  const removeFromQueue = useCallback((fileId: string) => {
    setDownloadQueue(prev => {
      if (prev.isDownloading) {
        return prev;
      }
      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId),
      };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setDownloadQueue(prev => {
      if (prev.isDownloading) {
        return prev;
      }
      return {
        files: [],
        isDownloading: false,
        currentFileIndex: 0,
        activeDownloadIds: new Set(),
        overallProgress: 0,
        hasCompleted: false,
        isProcessingFile: false,
        hasFailure: false,
      };
    });
  }, []);

  const startQueueDownload = useCallback(() => {
    const currentQueue = downloadQueueRef.current;
    if (currentQueue.files.length === 0) return;

    downloadResultsRef.current = { successCount: 0, errorCount: 0 };

    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: true,
      currentFileIndex: 0,
      activeDownloadIds: new Set(),
      overallProgress: 0,
      hasCompleted: false,
      isProcessingFile: false,
      hasFailure: false,
    }));

    setTimeout(() => {
      processDownloadQueue();
    }, 0);
  }, [processDownloadQueue]);

  const stopQueueDownload = useCallback(() => {
    const currentQueue = downloadQueueRef.current;

    currentQueue.activeDownloadIds.forEach(fileId => {
      const file = currentQueue.files.find(f => f.id === fileId);
      if (file) {
        const key = `${file.url}:${file.filePath}`;
        const currentDownload = downloads[key];
        if (currentDownload?.jobId) {
          fsStopDownload(currentDownload.jobId);
        }
      }
    });

    setDownloadQueue(prev => ({
      ...prev,
      isDownloading: false,
      activeDownloadIds: new Set(),
    }));
  }, [downloads]);

  const updateDownload = useCallback(
    (key: string, updates: Partial<Download>) => {
      setDownloads(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...updates,
        },
      }));
    },
    [setDownloads],
  );

  const addFilesToQueue = useCallback(
    (
      files: Omit<QueuedFile, 'contextId' | 'contextType'>[],
      contextId: string | number,
      contextType?: string,
    ) => {
      const filesWithContext = files.map(file => ({
        ...file,
        contextId,
        contextType,
      }));

      setDownloadQueue(prev => {
        if (prev.isDownloading) {
          return prev;
        }

        const newFiles = filesWithContext.filter(
          newFile => !prev.files.some(f => f.id === newFile.id),
        );

        newFiles.forEach(file => {
          const key = `${file.url}:${file.filePath}`;
          setDownloads(prevDownloads => {
            const existingDownload = prevDownloads[key];
            return {
              ...prevDownloads,
              [key]: {
                ...existingDownload,
                phase: DownloadPhase.Queued,
                isDownloaded: existingDownload?.isDownloaded ?? false,
                downloadProgress: undefined,
              },
            };
          });
        });

        return {
          ...prev,
          files: [...prev.files, ...newFiles],
        };
      });
    },
    [setDownloadQueue],
  );

  const removeFilesFromQueue = useCallback(
    (fileIds: string[]) => {
      setDownloadQueue(prev => {
        if (prev.isDownloading) {
          return prev;
        }
        return {
          ...prev,
          files: prev.files.filter(file => !fileIds.includes(file.id)),
        };
      });
    },
    [setDownloadQueue],
  );

  const getFilesByContext = useCallback(
    (contextId: string | number, contextType?: string) => {
      return downloadQueue.files.filter(
        file =>
          file.contextId === contextId &&
          (contextType === undefined || file.contextType === contextType),
      );
    },
    [downloadQueue.files],
  );

  const clearContextFiles = useCallback(
    (contextId: string | number, contextType?: string) => {
      setDownloadQueue(prev => {
        if (prev.isDownloading) {
          return prev;
        }
        return {
          ...prev,
          files: prev.files.filter(
            file =>
              !(
                file.contextId === contextId &&
                (contextType === undefined || file.contextType === contextType)
              ),
          ),
        };
      });
    },
    [setDownloadQueue],
  );

  const getDownloadKey = useCallback((request: DownloadRequest): string => {
    return `${request.source}:${request.destination}`;
  }, []);

  const status = useCallback(
    (request: DownloadRequest): Download | undefined => {
      const key = getDownloadKey(request);
      return downloads[key];
    },
    [downloads, getDownloadKey],
  );

  const download = useCallback(
    (...requests: DownloadRequest[]) => {
      const filesToAdd: QueuedFile[] = requests.map(request => {
        const contextId =
          request.area === DownloadArea.Course ? request.id : request.id;
        const contextType = request.area;

        return {
          id: request.id,
          name: request.destination.split('/').pop() || request.id,
          url: request.source,
          filePath: request.destination,
          contextId,
          contextType,
        };
      });

      setDownloadQueue(prev => {
        if (prev.isDownloading) {
          return prev;
        }

        const newFiles = filesToAdd.filter(
          newFile => !prev.files.some(f => f.id === newFile.id),
        );

        if (newFiles.length === 0) {
          return prev;
        }

        newFiles.forEach(file => {
          const key = getDownloadKey({
            area: (file.contextType as DownloadArea) || DownloadArea.Course,
            id: file.id,
            source: file.url,
            destination: file.filePath,
          });

          setDownloads(prevDownloads => ({
            ...prevDownloads,
            [key]: {
              ...prevDownloads[key],
              phase: DownloadPhase.Queued,
              isDownloaded: false,
              downloadProgress: undefined,
            },
          }));
        });

        return {
          ...prev,
          files: [...prev.files, ...newFiles],
        };
      });

      processDownloadQueueRef.current?.();
    },
    [getDownloadKey],
  );

  const clear = useCallback(
    (requestOrArea: DownloadRequest | DownloadArea) => {
      if (typeof requestOrArea === 'string') {
        const area = requestOrArea;
        setDownloadQueue(prev => {
          if (prev.isDownloading) {
            return prev;
          }

          const filesToRemove = prev.files.filter(
            file => file.contextType === area,
          );

          filesToRemove.forEach(file => {
            const key = getDownloadKey({
              area: (file.contextType as DownloadArea) || DownloadArea.Course,
              id: file.id,
              source: file.url,
              destination: file.filePath,
            });

            const downloadStatus = downloads[key];
            if (
              downloadStatus?.phase !== DownloadPhase.Downloading &&
              downloadStatus?.phase !== DownloadPhase.Completed
            ) {
              setDownloads(prevDownloads => {
                const newDownloads = { ...prevDownloads };
                delete newDownloads[key];
                return newDownloads;
              });
            }
          });

          return {
            ...prev,
            files: prev.files.filter(
              file =>
                file.contextType !== area ||
                downloads[
                  getDownloadKey({
                    area:
                      (file.contextType as DownloadArea) || DownloadArea.Course,
                    id: file.id,
                    source: file.url,
                    destination: file.filePath,
                  })
                ]?.phase === DownloadPhase.Downloading,
            ),
          };
        });
      } else {
        const request = requestOrArea;
        const key = getDownloadKey(request);
        const downloadStatus = downloads[key];

        if (
          downloadStatus?.phase !== DownloadPhase.Downloading &&
          downloadStatus?.phase !== DownloadPhase.Completed
        ) {
          setDownloads(prev => {
            const newDownloads = { ...prev };
            delete newDownloads[key];
            return newDownloads;
          });

          setDownloadQueue(prev => {
            if (prev.isDownloading) {
              return prev;
            }
            return {
              ...prev,
              files: prev.files.filter(f => f.id !== request.id),
            };
          });
        }
      }
    },
    [downloads, getDownloadKey],
  );

  const stop = useCallback(
    (requestOrArea: DownloadRequest | DownloadArea) => {
      if (typeof requestOrArea === 'string') {
        const area = requestOrArea;
        const currentQueue = downloadQueueRef.current;

        currentQueue.files
          .filter(file => file.contextType === area)
          .forEach(file => {
            const key = getDownloadKey({
              area: (file.contextType as DownloadArea) || DownloadArea.Course,
              id: file.id,
              source: file.url,
              destination: file.filePath,
            });
            const downloadStatus = downloads[key];
            if (downloadStatus?.jobId) {
              fsStopDownload(downloadStatus.jobId);
            }
          });

        setDownloadQueue(prev => ({
          ...prev,
          isDownloading: false,
          activeDownloadIds: new Set(),
        }));
      } else {
        const request = requestOrArea;
        const key = getDownloadKey(request);
        const downloadStatus = downloads[key];

        if (downloadStatus?.jobId) {
          fsStopDownload(downloadStatus.jobId);
        }

        setDownloads(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            phase: DownloadPhase.Error,
            downloadProgress: undefined,
          },
        }));
      }
    },
    [downloads, getDownloadKey],
  );

  return (
    <DownloadsContext.Provider
      value={{
        downloads,
        downloadQueue,
        addToQueue,
        removeFromQueue,
        clearQueue,
        startQueueDownload,
        stopQueueDownload,
        updateDownload,
        addFilesToQueue,
        removeFilesFromQueue,
        getFilesByContext,
        clearContextFiles,
        status,
        download,
        clear,
        stop,
        queueStatus: downloadQueue,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
