import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export const MessagesScreen = () => {
  const { t } = useTranslation();
  return (
    <View>
      <Text>{t('messagesScreen.title')}</Text>
    </View>
  );
};
