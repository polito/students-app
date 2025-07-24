import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';

const maxLength = 20;

const createOptions = (title: string, autoBackAction: boolean) => {
  const options: any = {
    headerTitle: title,
  };
  if (autoBackAction) {
    options.headerBackButtonDisplayMode =
      title.length <= maxLength ? 'default' : 'minimal';
  }
  return options;
};

/**
 * Sets the screen title and automatically hides the back action
 * when there is not enough space
 */
export const useScreenTitle = (
  title: string | undefined,
  autoBackAction = true,
) => {
  const { setOptions } = useNavigation();

  useEffect(() => {
    if (title) {
      setOptions(createOptions(title, autoBackAction));
    }
  }, [autoBackAction, setOptions, title]);
};
