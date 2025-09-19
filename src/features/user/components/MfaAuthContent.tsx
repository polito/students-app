import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { FetchChallenge200ResponseData, MessageType } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMfaAuth } from '../../../core/queries/authHooks';
import {
  useGetMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { signSecp256k1 } from '../../../utils/crypto';
import {
  AuthenticatorPrivKey,
  getPrivateKeyMFA,
  hasPrivateKeyMFA,
  resetPrivateKeyMFA,
} from '../../../utils/keychain';
import { createStyles } from './MfaEnrollContent';
import { UserStackParamList } from './UserNavigator';

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

  const calcSeconds = useCallback(
    () => Math.max(Math.ceil((expiryMs - Date.now()) / 1000), 0),
    [expiryMs],
  );

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

  const formattedTime = useMemo(() => {
    const mis = Math.floor(remainingSeconds / 60);
    const secs = (remainingSeconds % 60).toString().padStart(2, '0');
    return `${mis}:${secs}`;
  }, [remainingSeconds]);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList & UserStackParamList>
    >();
  const styles = useStylesheet(createStyles);
  const { mutate: verifyMfa, isPending } = useMfaAuth();
  const { mutate: markMessageAsRead } = useMarkMessageAsRead();
  const messagesQuery = useGetMessages();

  const [authPk, setAuthPk] = useState<AuthenticatorPrivKey | null | undefined>(
    undefined,
  );

  const markMfaMessageAsRead = useCallback(() => {
    const messages = messagesQuery.data;
    if (messages) {
      const mfaMessage = messages.find(
        m => m.type === MessageType.Mfa && !m.isRead,
      );
      if (mfaMessage) {
        markMessageAsRead(mfaMessage.id);
      }
    }
  }, [messagesQuery.data, markMessageAsRead]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileTab', {
        screen: 'Profile',
      });
    }
  }, [navigation]);

  useEffect(() => {
    if (authPk) return;
    if (authPk === null) {
      goBack();
      return;
    }

    const fetchPrivateKey = async () => {
      try {
        const secret = await getPrivateKeyMFA({
          title: t('mfaScreen.biometricPrompt'),
        });
        if (secret) {
          setAuthPk(AuthenticatorPrivKey.fromJSON(secret));
        } else {
          setAuthPk(null);
        }
      } catch (err) {
        console.error(err);
        const hasKey = await hasPrivateKeyMFA();
        if (hasKey) {
          Alert.alert(
            t('common.error'),
            t('mfaScreen.settings.notAccessible'),
            [
              {
                text: t('common.ok'),
                onPress: async () => {
                  await resetPrivateKeyMFA();
                  navigation.navigate('ProfileTab', {
                    screen: 'Settings',
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert(t('common.error'), t('mfaScreen.auth.unlockFailure'));
        }
        goBack();
      }
    };
    fetchPrivateKey();
  }, [t, goBack, authPk, navigation]);

  const onNo = async () => {
    if (!authPk) return;
    const signature = signSecp256k1(nonce, authPk, true);
    verifyMfa({
      decline: true,
      serial: authPk.serial,
      nonce,
      signature,
    });
    markMfaMessageAsRead();
    goBack();
  };

  const onYes = async () => {
    if (!authPk) return;
    try {
      const signature = signSecp256k1(nonce, authPk);
      verifyMfa({
        serial: authPk.serial,
        nonce,
        signature,
      });
    } catch (err) {
      Alert.alert(t('common.error'));
    }
    markMfaMessageAsRead();
    goBack();
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
          loading={isPending}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButton}
        />
        <CtaButton
          absolute={false}
          title={t('mfaScreen.auth.allow')}
          action={onYes}
          containerStyle={styles.primaryButtonContainer}
          disabled={isPending}
          loading={isPending}
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
