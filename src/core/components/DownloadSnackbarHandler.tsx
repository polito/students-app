import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDownloadsContext } from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';
import { getFileKey } from '../providers/downloads/downloadsFileUtils';

const DOWNLOAD_SNACKBAR_ID = 'download-progress';

const REMOVE_SNACKBAR_ID = 'remove-progress';

const LARGE_FILE_SIZE_KB = 20 * 1024;
const LARGE_FILES_MESSAGE_DELAY_MS = 4000;

export const DownloadSnackbarHandler = () => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const {
    downloads,
    downloadQueue,
    stopAndClearAllDownloads,
    isRemovalInProgress,
  } = useDownloadsContext();
  const downloadSnackbarShownRef = useRef(false);
  const removeSnackbarShownRef = useRef(false);
  const stopAndClearAllDownloadsRef = useRef(stopAndClearAllDownloads);
  const setFeedbackRef = useRef(setFeedback);
  const tRef = useRef(t);
  const largeFilesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  stopAndClearAllDownloadsRef.current = stopAndClearAllDownloads;
  setFeedbackRef.current = setFeedback;
  tRef.current = t;

  const isDownloading =
    downloadQueue.isDownloading && downloadQueue.files.length > 0;
  const totalCount = downloadQueue.totalToDownloadAtStart || 0;
  const completedToDownloadCount = downloadQueue.completedToDownloadCount || 0;
  const currentIndex =
    totalCount > 0 ? Math.min(completedToDownloadCount + 1, totalCount) : 1;
  const hasLargeFilesInQueue = downloadQueue.files
    .filter(f => !downloads[getFileKey(f)]?.isDownloaded)
    .some(f => (f.sizeInKiloBytes ?? 0) > LARGE_FILE_SIZE_KB);

  const [largeFilesMessageVisible, setLargeFilesMessageVisible] =
    useState(false);
  const hasLargeFilesInQueueRef = useRef(hasLargeFilesInQueue);
  hasLargeFilesInQueueRef.current = hasLargeFilesInQueue;

  useEffect(() => {
    if (!isDownloading && downloadSnackbarShownRef.current) {
      downloadSnackbarShownRef.current = false;
      setLargeFilesMessageVisible(false);
      setFeedbackRef.current({
        text: tRef.current('common.downloadCompletedShort'),
        isPersistent: false,
      });
    }
  }, [isDownloading]);

  useEffect(() => {
    if (!isDownloading) {
      setLargeFilesMessageVisible(false);
      if (largeFilesTimeoutRef.current) {
        clearTimeout(largeFilesTimeoutRef.current);
        largeFilesTimeoutRef.current = null;
      }
      return;
    }
    if (largeFilesTimeoutRef.current) return;
    largeFilesTimeoutRef.current = setTimeout(() => {
      largeFilesTimeoutRef.current = null;
      if (hasLargeFilesInQueueRef.current) {
        setLargeFilesMessageVisible(true);
      }
    }, LARGE_FILES_MESSAGE_DELAY_MS);
    return () => {
      if (largeFilesTimeoutRef.current) {
        clearTimeout(largeFilesTimeoutRef.current);
        largeFilesTimeoutRef.current = null;
      }
    };
  }, [isDownloading]);

  useEffect(() => {
    if (!isDownloading || totalCount <= 0) return;
    downloadSnackbarShownRef.current = true;
    const progressText = tRef.current('common.downloadInProgressCount', {
      current: currentIndex,
      total: totalCount,
    });
    const largeFilesHint =
      largeFilesMessageVisible && hasLargeFilesInQueue
        ? `\n${tRef.current('common.downloadLargeFilesPleaseWait')}`
        : '';
    setFeedbackRef.current({
      id: DOWNLOAD_SNACKBAR_ID,
      text: progressText + largeFilesHint,
      isPersistent: true,
      action: {
        label: tRef.current('common.stop'),
        onPress: () => {
          stopAndClearAllDownloadsRef.current();
          setFeedbackRef.current(null);
          downloadSnackbarShownRef.current = false;
          setLargeFilesMessageVisible(false);
        },
      },
    });
  }, [
    isDownloading,
    currentIndex,
    totalCount,
    largeFilesMessageVisible,
    hasLargeFilesInQueue,
  ]);

  useEffect(() => {
    if (isRemovalInProgress && !removeSnackbarShownRef.current) {
      removeSnackbarShownRef.current = true;
      setFeedbackRef.current({
        id: REMOVE_SNACKBAR_ID,
        text: tRef.current('common.removeInProgress'),
        isPersistent: true,
      });
    }
  }, [isRemovalInProgress]);

  useEffect(() => {
    if (!isRemovalInProgress && removeSnackbarShownRef.current) {
      removeSnackbarShownRef.current = false;
      setFeedbackRef.current({
        text: tRef.current('common.removeCompletedShort'),
        isPersistent: false,
      });
    }
  }, [isRemovalInProgress]);

  return null;
};
