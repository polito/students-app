import { useHeaderHeight } from '@react-navigation/elements';

import { IS_IOS, SCREEN_WIDTH } from '../constants';

export const useScrollViewStyle = () => {
  const headerHeight = useHeaderHeight();

  return {
    width: SCREEN_WIDTH,
    marginTop: IS_IOS ? headerHeight : undefined,
  };
};
