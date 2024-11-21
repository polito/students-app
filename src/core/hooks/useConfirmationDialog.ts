import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert } from 'react-native';

interface Options {
  title?: string;
  message?: string;
}

export const useConfirmationDialog = ({ title, message }: Options = {}) => {
  const { t } = useTranslation();
  return () =>
    new Promise<boolean>(resolve => {
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(
          t('bookingScreen.cancelBookingText'),
        );
      }, 500);
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
