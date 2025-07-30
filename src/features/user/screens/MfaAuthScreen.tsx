import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PolitoAuthenticatorLogo } from '../../../../src/core/components/PolitoAuthenticatorLogo';
import { useMfaAuth } from '../../../../src/core/queries/authHooks';
import { authSign } from '../../../../src/utils/crypto';
import { getPrivateKeyMFA } from '../../../../src/utils/keychain';

type RootStackParamList = {
  MfaAuth: { serial: string; nonce: string };
};
type Props = {
  expirationTs: string;
};
export const MfaAuthScreen = ({ expirationTs }: Props) => {
  const { t } = useTranslation();
  const expiryMs = new Date(expirationTs).getTime();

  const calcSeconds = useCallback(() => {
    return Math.max(Math.ceil((expiryMs - Date.now()) / 1000), 0);
  }, [expiryMs]);

  const [remainingSeconds, setRemainingSeconds] = useState(calcSeconds);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setRemainingSeconds(calcSeconds());
      setTimeout(tick, 1000);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [expiryMs, calcSeconds]);

  const formattedTime = `${Math.floor(remainingSeconds / 60)}:${(
    remainingSeconds % 60
  )
    .toString()
    .padStart(2, '0')}`;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { nonce } = useRoute().params as RootStackParamList['MfaAuth'];
  const styles = useStylesheet(createStyles);
  const { mutate: verifyMfa, isLoading } = useMfaAuth();

  const onNo = () => navigation.goBack();

  const onYes = async () => {
    try {
      const secret = await getPrivateKeyMFA();
      if (secret) {
        const secretParsed: any = JSON.parse(secret);
        const signature = authSign(
          secretParsed.serial,
          nonce,
          secretParsed.privateKeyB64,
        );
        verifyMfa({ serial: secretParsed.serial, nonce, signature });
      }
    } catch (err) {
      Alert.alert(t('common.error'));
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <PolitoAuthenticatorLogo style={styles.logo} />
        <Text style={styles.subtitle}>{t('mfaScreen.promptAuth')}</Text>

        <View style={styles.buttonsRow}>
          <CtaButton
            absolute={false}
            title={t('mfaScreen.denyAccess')}
            action={onNo}
            variant="outlined"
            containerStyle={styles.secondaryButtonContainer}
            disabled={isLoading}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButton}
          />
          <CtaButton
            absolute={false}
            title={t('mfaScreen.allowAccess')}
            action={onYes}
            containerStyle={styles.primaryButtonContainer}
            disabled={isLoading}
            style={styles.primaryButton}
          />
        </View>
        <Text style={styles.time}>
          {t('mfaScreen.expirationTime', { time: formattedTime })}
        </Text>
        <Text style={styles.note}>{t('mfaScreen.noteAuth')}</Text>
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
      borderRadius: 12,
      width: spacing[40],
    },
    secondaryButtonContainer: {
      flex: 1,
      gap: 8,
    },
    secondaryButton: {
      borderRadius: 12,
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
