import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { FetchChallenge200ResponseData, MessageType } from '@polito/api-client';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RTFTrans } from '~/core/components/RTFTrans';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';

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
import useAppState from '../../../utils/useAppState';
import { createStyles } from './MfaEnrollContent';
import { UserStackParamList } from './UserNavigator';

type Props = {
  challenge: FetchChallenge200ResponseData;
  navigation: NativeStackNavigationProp<UserStackParamList>;
};
export const MfaAuthScreen = ({ challenge, navigation }: Props) => {
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

  const formattedTime = useMemo(() => {
    const mis = Math.floor(remainingSeconds / 60);
    const secs = (remainingSeconds % 60).toString().padStart(2, '0');
    return `${mis}:${secs}`;
  }, [remainingSeconds]);
  const styles = useStylesheet(createStyles);
  const { mutate: verifyMfa, isPending } = useMfaAuth();
  const { mutate: markMessageAsRead } = useMarkMessageAsRead();
  const messagesQuery = useGetMessages();
  const appState = useAppState();
  const [authPk, setAuthPk] = useState<
    AuthenticatorPrivKey | null | undefined
  >();
  const { setFeedback } = useFeedbackContext();
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

  const finalizeAuth = useCallback(
    (feedbackLabel: string) => {
      markMfaMessageAsRead();
      setFeedback({
        text: t(feedbackLabel),
        isPersistent: false,
      });
      navigation.goBack();
    },
    [markMfaMessageAsRead, setFeedback, t, navigation],
  );

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const newSeconds = calcSeconds();
      setRemainingSeconds(newSeconds);
      if (newSeconds <= 0) {
        finalizeAuth('mfaScreen.auth.expired');
      } else {
        setTimeout(tick, 1000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [expiryMs, calcSeconds, finalizeAuth]);

  useEffect(() => {
    if (authPk || appState !== 'active') return;
    if (authPk === null) {
      navigation.goBack();
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
            t('mfaScreen.settings.notAccessibleAlert'),
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
        navigation.goBack();
      }
    };
    fetchPrivateKey().catch(console.error);
  }, [t, authPk, navigation, appState]);

  const onNo = async () => {
    if (!authPk) return;
    const signature = signSecp256k1(nonce, authPk, true);
    verifyMfa({
      decline: true,
      serial: authPk.serial,
      nonce,
      signature,
    });
    finalizeAuth('mfaScreen.auth.rejected');
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
    finalizeAuth('mfaScreen.auth.accepted');
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
          disabled={isPending}
          loading={isPending}
          style={styles.secondaryButton}
          textStyle={styles.secondaryButton}
        />
        <CtaButton
          absolute={false}
          title={t('mfaScreen.auth.allow')}
          action={onYes}
          disabled={isPending}
          loading={isPending}
          style={styles.primaryButton}
        />
      </View>
      <Text style={styles.time}>
        {t('mfaScreen.auth.expiration', { time: formattedTime })}
      </Text>
      <RTFTrans style={styles.note} i18nKey="mfaScreen.auth.note" />
    </>
  );
};
