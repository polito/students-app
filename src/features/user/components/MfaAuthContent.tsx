import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { FetchChallenge200ResponseData } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMfaAuth } from '../../../core/queries/authHooks';
import { authSign } from '../../../utils/crypto';
import { getPrivateKeyMFA } from '../../../utils/keychain';
import { createStyles } from './MfaEnrollContent';

type RootStackParamList = {
  MfaAuth: { serial: string; nonce: string };
};
type Props = {
  challenge: FetchChallenge200ResponseData;
};
export const MfaAuthScreen = ({ challenge }: Props) => {
  const { t } = useTranslation();
  const { challenge: nonce } = challenge;
  const expiryMs = challenge?.expirationTs
    ? new Date(challenge.expirationTs).getTime()
    : 0;

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
  const styles = useStylesheet(createStyles);
  const { mutate: verifyMfa, isPending } = useMfaAuth();

  const onNo = async () => {
    navigation.goBack();
    verifyMfa({
      nonce,
      decline: true,
      serial: 'nil',
      signature: 'nil',
    });
  };

  const onYes = async () => {
    try {
      const secret = await getPrivateKeyMFA({
        title: t('mfaScreen.biometricPrompt'),
      });
      if (secret) {
        const secretParsed: any = JSON.parse(secret);
        const signature = authSign(
          secretParsed.serial,
          nonce,
          secretParsed.privateKeyB64,
        );
        verifyMfa({
          serial: secretParsed.serial,
          nonce,
          signature,
        });
      }
    } catch (err) {
      Alert.alert(t('common.error'));
    }
  };

  return (
    <>
      <Text style={styles.subtitle}>{t('mfaScreen.auth.prompt')}</Text>

      <View style={styles.buttonsRow}>
        <CtaButton
          absolute={false}
          title={t('mfaScreen.auth.denyAccess')}
          action={onNo}
          variant="outlined"
          containerStyle={styles.secondaryButtonContainer}
          disabled={isPending}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButton}
        />
        <CtaButton
          absolute={false}
          title={t('mfaScreen.auth.allow')}
          action={onYes}
          containerStyle={styles.primaryButtonContainer}
          disabled={isPending}
          style={styles.primaryButton}
        />
      </View>
      <Text style={styles.time}>
        {t('mfaScreen.auth.expiration', { time: formattedTime })}
      </Text>
      <Text style={styles.note}>{t('mfaScreen.auth.note')}</Text>
    </>
  );
};
