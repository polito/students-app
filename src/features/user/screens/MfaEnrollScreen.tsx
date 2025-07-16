// src/screens/mfa/MfaEnrollScreen.tsx
import { useTranslation } from 'react-i18next';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MfaActivation: undefined;
  MfaSetup: undefined;
};

export const MfaEnrollScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = useStylesheet(createStyles);

  const onNo = () => navigation.goBack();
  const onYes = () => navigation.replace('MfaSetup');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('../../../../assets/images/polito_authenticator_logo.svg')}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          {t('mfaActivation.title', 'Attivazione MFA')}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            'mfaActivation.prompt',
            'Vuoi attivare PoliTO Authenticator su questo dispositivo?',
          )}
        </Text>

        <View style={styles.buttonsRow}>
          <CtaButton
            absolute={false}
            title={t('common.no', 'No')}
            action={onNo}
            containerStyle={styles.secondaryButton}
          />
          <CtaButton
            absolute={false}
            title={t('common.yes', 'Sì')}
            action={onYes}
            containerStyle={styles.primaryButton}
          />
        </View>

        <Text style={styles.note}>
          {t(
            'mfaActivation.note',
            'Ti permetterà di accedere più rapidamente senza dover attendere SMS o usare autenticatori esterni.',
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    logo: {
      width: spacing[12],
      height: spacing[12],
      marginBottom: spacing[4],
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '100%',
      paddingHorizontal: spacing[4],
      paddingVertical: '50%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...{
        fontSize: 24,
        fontWeight: '600',
      },
      color: colors.caption,
      textAlign: 'center',
      marginBottom: spacing[2],
    },
    subtitle: {
      ...{
        fontSize: 16,
      },
      color: colors.caption,
      textAlign: 'center',
      marginBottom: spacing[4],
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: spacing[4],
    },
    primaryButton: {
      flex: 1,
      marginHorizontal: spacing[2],
    },
    secondaryButton: {
      flex: 1,
      marginHorizontal: spacing[2],
    },
    note: {
      ...{
        fontSize: 14,
      },
      color: colors.caption,
      textAlign: 'center',
      marginTop: spacing[4],
    },
  });
