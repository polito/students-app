import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const HeaderCloseButton = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<any>;
}) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <Pressable
      onPress={navigation.goBack}
      accessibilityLabel={t('common.close')}
      accessibilityRole="button"
      style={{ padding: spacing['2'] }}
    >
      <Icon icon={faTimes} size={24} />
    </Pressable>
  );
};

export const createHeaderCloseButton =
  (navigation: NativeStackNavigationProp<any>) => () => (
    <HeaderCloseButton navigation={navigation} />
  );
