import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';

import { PolitoAuthenticatorLogo } from '../../../../src/core/components/PolitoAuthenticatorLogo';
import { useMfaEnrol } from '../../../../src/core/queries/authHooks';
import { keyGenerator } from '../../../../src/utils/crypto';
import { savePrivateKeyMFA } from '../../../../src/utils/keychain';

export const MfaEnrollScreen = () => {
  const { t } = useTranslation();
  const { mutate: enrolMfa, isPending } = useMfaEnrol();

  const { publicKey, privateKey } = keyGenerator();

  const navigation = useNavigation();
  const styles = useStylesheet(createStyles);
  const onNo = () => navigation.goBack();
  const onYes = async () => {
    const deviceId = await DeviceInfo.getDeviceId();
    const dtoMfa = { description: deviceId, pubkey: publicKey };

    enrolMfa(dtoMfa, {
      onSuccess: async res => {
        const saved = await savePrivateKeyMFA(res.serial, privateKey);
        if (!saved) {
          console.error(
            'Errore',
            'Non è stato possibile salvare la chiave privata MFA.',
          );
          return;
        }
        navigation.goBack();
      },
      onError: () => {},
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PolitoAuthenticatorLogo style={styles.logo} />
        <Text style={styles.subtitle}>{t('mfaScreen.promptEnrol')}</Text>

        <View style={[styles.buttonsRow, { justifyContent: 'space-between' }]}>
          <CtaButton
            absolute={false}
            title={t('mfaScreen.noEnrol')}
            action={onNo}
            variant="outlined"
            containerStyle={styles.secondaryButtonContainer}
            style={styles.secondaryButton}
          />
          <CtaButton
            absolute={false}
            title={t('mfaScreen.yesEnrol')}
            action={onYes}
            containerStyle={styles.primaryButtonContainer}
            style={styles.primaryButton}
            loading={isPending}
          />
        </View>

        <Text style={styles.note}>{t('mfaScreen.noteEnrol')}</Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = ({ colors, spacing, palettes }: Theme) =>
  StyleSheet.create({
    logo: {
      width: spacing[96],
      height: spacing[32],
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
      fontSize: 24,
      fontWeight: '600',
      color: colors.caption,
      textAlign: 'center',
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: 16,
      color: colors.caption,
      textAlign: 'center',
      marginBottom: spacing[4],
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    primaryButtonContainer: {
      flex: 1,
    },
    primaryButton: {
      backgroundColor: palettes.primary[500],
      borderColor: palettes.primary[500],
      width: spacing[40],
    },
    secondaryButtonContainer: {
      flex: 1,
      gap: 8,
    },
    secondaryButton: {
      borderColor: palettes.primary[500],
      color: palettes.primary[500],
      width: spacing[40],
    },
    time: {
      fontWeight: 500,
      fontSize: 14,
      color: colors.caption,
      textAlign: 'center',
      marginTop: spacing[5],
    },
    note: {
      fontSize: 14,
      color: colors.caption,
      textAlign: 'center',
      marginTop: spacing[5],
    },
  });
