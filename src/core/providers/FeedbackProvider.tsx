import { PropsWithChildren, useState } from 'react';

import { Snackbar } from '@lib/ui/components/Snackbar';
import { Feedback } from '@lib/ui/types/Feedback';

import { FeedbackContext } from '../contexts/FeedbackContext';

export const FeedbackProvider = ({ children }: PropsWithChildren) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  const setNextFeedback = (nextFeedback: Feedback | null) => {
    if (
      isSnackbarVisible &&
      feedback &&
      nextFeedback?.id &&
      nextFeedback.id === feedback.id
    ) {
      setFeedback({
        ...feedback,
        ...nextFeedback,
      });
      return;
    }
    if (isSnackbarVisible) {
      // A snackbar is already visible, so we need to hide it and then show the new one
      setIsSnackbarVisible(false);
      setTimeout(() => {
        if (nextFeedback === null) {
          setFeedback(null);
        } else {
          setFeedback({
            isPersistent: false,
            isError: false,
            ...nextFeedback,
          });
          setIsSnackbarVisible(true);
        }
      }, Snackbar.ANIMATION);
    } else {
      if (nextFeedback === null) {
        setFeedback(null);
      } else {
        setFeedback({
          isPersistent: false,
          isError: false,
          ...nextFeedback,
        });
        setIsSnackbarVisible(true);
      }
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedback,
        setFeedback: setNextFeedback,
        isFeedbackVisible: isSnackbarVisible,
      }}
    >
      {children}
      {feedback && (
        <Snackbar
          {...feedback}
          visible={isSnackbarVisible}
          onDismiss={() => {
            setIsSnackbarVisible(false);
          }}
        />
      )}
    </FeedbackContext.Provider>
  );
};
