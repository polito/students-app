import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, EventSubscription, Platform, Text, View } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { FetchChallenge200ResponseData, MessageType } from '@polito/api-client';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  State,
  ToothPicError,
  ToothPicSDK,
} from '@toothpic.eu/react-native-toothpic-sdk';

import { RTFTrans } from '~/core/components/RTFTrans';
import { ToothPicLogoPayoff } from '~/core/components/ToothPicLogo';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';
import { Sentry } from '~/utils/sentry';

import base32Encode from 'base32-encode';
// ts/linter does not complain without Buffer, but it's needed at runtime
import { Buffer } from 'buffer';

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
import { CircularProgress } from './CircularProgress';
import { IndeterminateCircularProgress } from './IndeterminateCircularProgress';
import { createStyles, useControlledProgress } from './MfaEnrollContent';
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
  const { mutateAsync: verifyMfa, isPending } = useMfaAuth();
  const { mutate: markMessageAsRead } = useMarkMessageAsRead();
  const messagesQuery = useGetMessages();
  const appState = useAppState();
  const [authPk, setAuthPk] = useState<
    AuthenticatorPrivKey | null | undefined
  >();
  const [progressMessage, setProgressMessage] = useState(
    t('mfaScreen.toothpic.capturingPhotons'),
  );
  const [showIndeterminateProgressBar, setShowIndeterminateProgressBar] =
    useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [step, setStep] = useState(0);
  const { progress, setProgress, setMaxProgress } = useControlledProgress();
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
    (feedbackLabel: string, success: boolean) => {
      markMfaMessageAsRead();
      setFeedback({
        text: success ? t(feedbackLabel) : t('mfaScreen.auth.failed'),
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
        finalizeAuth('mfaScreen.auth.expired', true);
      } else {
        setTimeout(tick, 1000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [expiryMs, calcSeconds, finalizeAuth]);

  const listenerSubscription = useRef<null | EventSubscription>(null);

  useEffect(() => {
    listenerSubscription.current = ToothPicSDK?.onProgress(state => {
      handleAuthenticationProgress(state);
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  });

  const checkCameraPermission = useCallback(async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });
    if (!permission) return;

    try {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          t('mfaScreen.enroll.registration.cameraPermissionTitle'),
          t('mfaScreen.enroll.registration.cameraPermissionMessage'),
          [
            {
              text: t('mfaScreen.enroll.registration.cameraPermissionDeny'),
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
            {
              text: t('mfaScreen.enroll.registration.cameraPermissionAllow'),
              onPress: () => checkCameraPermission(),
            },
          ],
        );
        return false;
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }, [t, navigation]);

  useEffect(() => {
    if (authPk || appState !== 'active') return;

    const fetchPrivateKey = async () => {
      try {
        const secret = await getPrivateKeyMFA({
          title: t('mfaScreen.biometricPrompt'),
        });
        if (secret) {
          setAuthPk(AuthenticatorPrivKey.fromJSON(secret));
        } else {
          await resetPrivateKeyMFA();
          throw new Error('Invalid PK');
        }
      } catch (err) {
        console.error(err);
        const hasKey = await hasPrivateKeyMFA();
        if (!hasKey) {
          Alert.alert(
            t('common.error'),
            t('mfaScreen.settings.notAccessibleAlert'),
            [
              {
                text: t('common.ok'),
                onPress: async () => {
                  navigation.navigate('ProfileTab', {
                    screen: 'Settings',
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert(t('common.error'), t('mfaScreen.auth.unlockDismissed'));
        }
        navigation.goBack();
      }
    };
    fetchPrivateKey().catch(console.error);
  }, [t, authPk, navigation, appState]);

  const onNo = async () => {
    if (!authPk) return;

    const decline = true;

    if (authPk.type === 'secp256k1') {
      await sign(decline);
    } else if (authPk.type === 'toothpic') {
      await signWithToothPic(decline);
    }
  };

  const onYes = async () => {
    if (!authPk) return;

    const decline = false;

    if (authPk.type === 'secp256k1') {
      await sign(decline);
    } else if (authPk.type === 'toothpic') {
      await signWithToothPic(decline);
    }
  };

  const sign = async (decline: boolean) => {
    let success = false;
    try {
      const signature = signSecp256k1(nonce, authPk!, decline);
      success = await verifyMfa({
        decline: decline,
        serial: authPk!.serial,
        nonce,
        signature,
      });
    } catch (err) {
      Alert.alert(t('common.error'));
    }
    if (decline) {
      finalizeAuth('mfaScreen.auth.rejected', success);
    } else {
      finalizeAuth('mfaScreen.auth.accepted', success);
    }
  };

  const signWithToothPic = async (decline: boolean) => {
    if (step === 0) {
      setStep(1);
    }

    const granted = await checkCameraPermission();
    if (!granted) {
      return;
    }

    const messageParts = [nonce, authPk!.serial];

    if (decline) {
      messageParts.push('decline');
    }

    const message = new Uint8Array(
      Buffer.from(messageParts.join('|'), 'utf-8'),
    );

    setProgressMessage(t('mfaScreen.toothpic.capturingPhotons'));
    setProgress(0.0);
    setMaxProgress(0.4);
    let success = false;

    try {
      const signatureData = await ToothPicSDK.signWithCredential(
        authPk!.privateKeyB64,
        message,
      );

      const base32Signature = base32Encode(
        new Uint8Array(signatureData.signature),
        'RFC4648',
      );

      success = await verifyMfa({
        decline: decline,
        serial: authPk!.serial,
        nonce,
        signature: base32Signature,
      });
    } catch (error: any) {
      setMaxProgress(0);

      if (error instanceof ToothPicError) {
        const toothpicError = error.toString();
        const shootParameters = error.shootParameters;
        Sentry.captureMessage(
          'Signature error: ' + toothpicError + ' ' + shootParameters,
          'warning',
        );
      }
    }

    if (decline) {
      finalizeAuth('mfaScreen.auth.rejected', success);
    } else {
      finalizeAuth('mfaScreen.auth.accepted', success);
    }
  };

  const handleAuthenticationProgress = (state: State) => {
    switch (state) {
      case 'AUTOPARAMETER_SIGNATURE':
        setProgress(0.4);
        setMaxProgress(0.8);
        setProgressMessage(t('mfaScreen.toothpic.analyzingFingerprint'));
        break;
      case 'CAPTURE_COMPLETED_SIGNATURE':
        setProgress(0.8);
        setMaxProgress(0.99);
        setProgressMessage(t('mfaScreen.toothpic.creatingUnclonableKey'));
        break;
      case 'DONE_SIGNATURE':
        setProgress(1.0);
        setMaxProgress(1.0);
        break;
      case 'PREVIEW_OK':
        setShowIndeterminateProgressBar(false);
        setShowWarning(false);
        break;
      case 'PREVIEW_TOO_DARK':
        setShowIndeterminateProgressBar(true);
        setShowWarning(true);
        break;
    }
  };

  if (step === 0) {
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
  }
  if (step === 1) {
    return (
      <>
        <Text style={styles.registrationInProgress}>
          {t('mfaScreen.auth.inProgress')}
        </Text>
        {showIndeterminateProgressBar ? (
          <IndeterminateCircularProgress strokeWidth={16} />
        ) : (
          <CircularProgress
            strokeWidth={16}
            progress={progress}
            text={progressMessage}
          />
        )}
        <Text style={[styles.cameraWarning, !showWarning && styles.hidden]}>
          {t('mfaScreen.toothpic.uncoverTheCamera')}
        </Text>
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
        <View style={styles.containerLogo}>
          <ToothPicLogoPayoff
            style={[
              styles.toothpicLogoPayoff,
              authPk?.type !== 'toothpic' && styles.hidden,
            ]}
          />
        </View>
      </>
    );
  }
  return null;
};
