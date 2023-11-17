import { useCallback, useState } from 'react';

import { BottomModalProps } from '../components/BottomModal';

export const useBottomModal = () => {
  const [modal, setModal] = useState<BottomModalProps>({
    visible: false,
  });

  const close = useCallback(() => {
    setModal({
      visible: false,
    });
  }, []);

  const open = useCallback(
    (children: BottomModalProps['children']) => {
      setModal({
        visible: true,
        onClose: close,
        children,
      });
    },
    [close],
  );

  return {
    close,
    open,
    modal,
  };
};
