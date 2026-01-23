import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton.tsx';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import { Theme } from '@lib/ui/types/Theme.ts';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { GuestStackParamList } from '~/core/components/GuestNavigator.tsx';
import { PolitoLogo } from '~/core/components/Logo.tsx';
import { useAuth } from '~/core/hooks/useAuth.ts';

type Props = NativeStackScreenProps<GuestStackParamList, 'SSO'>;

type SSOScreenRouteProp = RouteProp<
  { SSO: { uid: string; key: string } },
  'SSO'
>;

export const SSOScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();
  const route = useRoute<SSOScreenRouteProp>();
  const { key } = route.params || {};
  const { handleSSO, isLoading } = useAuth(key);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <PolitoLogo width="100%" height="100%" />
        </View>
      </View>
      <CtaButtonContainer absolute={true} style={{ gap: spacing[0] }}>
        <CtaButton
          absolute={false}
          tkey="ssoScreen.ssoButton"
          action={() => handleSSO()}
          loading={isLoading}
        />
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          <Text variant="link" style={styles.textLink}>
            {t('ssoScreen.ssoLink')}
          </Text>
        </TouchableOpacity>
        <View style={{ height: spacing[10] }} />
      </CtaButtonContainer>
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      width: '30%',
      aspectRatio: 120 / 168,
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    link: {
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      marginBottom: spacing[3],
    },
    textLink: { textDecorationLine: 'underline' },
  });
