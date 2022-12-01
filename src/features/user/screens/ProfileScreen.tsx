import { useTranslation } from 'react-i18next';
import * as Keychain from 'react-native-keychain';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useLogout } from '../../../core/queries/authHooks';

export const ProfileScreen = () => {
  const { mutateAsync: handleLogout, isLoading } = useLogout();

  const { refreshContext } = useApiContext();
  const { spacing } = useTheme();
  const { t } = useTranslation();

  const onSuccessfulLogout = async () => {
    await Keychain.resetGenericPassword();
    refreshContext();
  };

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Text variant="heading" style={{ padding: spacing[4] }}>
        {t('profileScreen.title')}
      </Text>
      <CtaButton
        absolute={false}
        title="Logout"
        action={() => handleLogout().then(onSuccessfulLogout)}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};
