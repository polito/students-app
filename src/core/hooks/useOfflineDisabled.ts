import { useState } from 'react';

import { onlineManager } from '@tanstack/react-query';

export const useOfflineDisabled = (
  isDataMissingCallback: () => boolean = () => true,
) => {
  const [isDisabled, setIsDisabled] = useState(
    !onlineManager.isOnline() && isDataMissingCallback(),
  );

  onlineManager.subscribe(() => {
    if (onlineManager.isOnline()) {
      setIsDisabled(false);
    } else {
      setIsDisabled(isDataMissingCallback());
    }
  });

  return isDisabled;
};
