import { createContext, useContext } from 'react';

import { Feedback } from '@lib/ui/types/Feedback';

type FeedbackContextProps = {
  feedback: Feedback | null;
  setFeedback: (f: Feedback) => void;
};

export const FeedbackContext = createContext<FeedbackContextProps | undefined>(
  undefined,
);

export const useFeedbackContext = () => {
  const feedbackContext = useContext(FeedbackContext);
  if (!feedbackContext)
    throw new Error(
      'No FeedbackContext.Provider found when calling useFeedbackContext.',
    );
  return feedbackContext;
};
