import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useDownloadsContext } from '../contexts/DownloadsContext';
import { useFeedbackContext } from '../contexts/FeedbackContext';

const DOWNLOAD_SNACKBAR_ID = 'download-progress';

const REMOVE_SNACKBAR_ID = 'remove-progress';

export const DownloadSnackbarHandler = () => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const { downloadQueue, stopAndClearAllDownloads, isRemovalInProgress } =
    useDownloadsContext();
  const downloadSnackbarShownRef = useRef(false);
  const removeSnackbarShownRef = useRef(false);
  const stopAndClearAllDownloadsRef = useRef(stopAndClearAllDownloads);
  const setFeedbackRef = useRef(setFeedback);
  const tRef = useRef(t);
  stopAndClearAllDownloadsRef.current = stopAndClearAllDownloads;
  setFeedbackRef.current = setFeedback;
  tRef.current = t;

  const isDownloading =
    downloadQueue.isDownloading && downloadQueue.files.length > 0;
  const totalCount = downloadQueue.files.length;
  const currentIndex = Math.min(downloadQueue.currentFileIndex + 1, totalCount);

  useEffect(() => {
    if (!isDownloading && downloadSnackbarShownRef.current) {
      downloadSnackbarShownRef.current = false;
      setFeedbackRef.current({
        text: tRef.current('common.downloadCompletedShort'),
        isPersistent: false,
      });
    }
  }, [isDownloading]);

  useEffect(() => {
    if (!isDownloading || totalCount <= 0) return;
    downloadSnackbarShownRef.current = true;
    setFeedbackRef.current({
      id: DOWNLOAD_SNACKBAR_ID,
      text: tRef.current('common.downloadInProgressCount', {
        current: currentIndex,
        total: totalCount,
      }),
      isPersistent: true,
      action: {
        label: tRef.current('common.stop'),
        onPress: () => {
          stopAndClearAllDownloadsRef.current();
          setFeedbackRef.current(null);
          downloadSnackbarShownRef.current = false;
        },
      },
    });
  }, [isDownloading, currentIndex, totalCount]);

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
