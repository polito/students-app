import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';

const maxLength = 20;

const createOptions = (title: string, autoBackAction: boolean) => {
  const options: any = {
    headerTitle: title,
  };
  if (autoBackAction) {
    options.headerBackTitleVisible = title.length <= maxLength;
  }
  return options;
};

/**
 * Sets the screen title and automatically hides the back action
 * when there is not enough space
 */
export const useScreenTitle = (title: string, autoBackAction = true) => {
  const { setOptions } = useNavigation();

  setOptions(createOptions(title, autoBackAction));

  useEffect(() => {
    setOptions(createOptions(title, autoBackAction));
  }, [title]);
};
