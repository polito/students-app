import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

interface Options {
  title: string;
  message?: string;
}

export const useConfirmationDialog = ({ title, message }: Options) => {
  const { t } = useTranslation();
  return () =>
    new Promise<boolean>(resolve => {
      Alert.alert(
        title,
        message,
        [
          { text: t('common.ok'), onPress: () => resolve(true) },
          { text: t('common.cancel'), onPress: () => resolve(false) },
        ],
        { cancelable: false },
      );
    });
};
