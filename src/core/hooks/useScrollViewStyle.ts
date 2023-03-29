import { useHeaderHeight } from '@react-navigation/elements';

import { IS_IOS } from '../constants';

export const useScrollViewStyle = () => {
  const headerHeight = useHeaderHeight();

  return {
    paddingTop: IS_IOS ? headerHeight : undefined,
  };
};
