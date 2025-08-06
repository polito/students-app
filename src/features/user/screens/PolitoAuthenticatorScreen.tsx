import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHideTabs } from '~/core/hooks/useHideTabs';

import { PolitoAuthenticatorLogo } from '../../../core/components/PolitoAuthenticatorLogo';
import { MfaAuthScreen } from '../components/MfaAuthContent';
import { MfaEnrollScreen } from '../components/MfaEnrollContent';
import { UserStackParamList } from '../components/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'PolitoAuthenticator'>;

export const PolitoAuthenticatorScreen = ({ route }: Props) => {
  const { activeView, challenge } = route.params;
  const styles = useStylesheet(createStyles);

  useHideTabs();
  const { bottom } = useSafeAreaInsets();

  if (!activeView) return null;

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <PolitoAuthenticatorLogo style={styles.logo} />
      {activeView === 'enroll' ? (
        <MfaEnrollScreen />
      ) : activeView === 'auth' && challenge ? (
        <MfaAuthScreen challenge={challenge} />
      ) : null}
    </View>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    logo: {
      width: spacing[96],
      height: spacing[32],
      marginBottom: spacing[8],
    },
    container: {
      backgroundColor: colors.background,
      width: '100%',
      paddingHorizontal: spacing[4],
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
