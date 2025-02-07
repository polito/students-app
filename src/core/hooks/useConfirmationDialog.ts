import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { setTimeoutAccessibilityInfoHelper } from '../../utils/setTimeoutAccessibilityInfo';

interface Options {
  title?: string;
  message?: string;
}

export const useConfirmationDialog = ({ title, message }: Options = {}) => {
  const { t } = useTranslation();
  return () =>
    new Promise<boolean>(resolve => {
      setTimeoutAccessibilityInfoHelper(
        t('bookingScreen.cancelBookingText'),
        500,
      );
      Alert.alert(
        title ?? t('common.areYouSure?'),
        message ?? t('common.actionPotentiallyNotUndoable'),
        [
          { text: t('common.ok'), onPress: () => resolve(true) },
          { text: t('common.cancel'), onPress: () => resolve(false) },
        ],
        { cancelable: false },
      );
    });
};
