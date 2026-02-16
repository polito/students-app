import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  EventSubscription,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {
  faArrowLeft,
  faCamera,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { RadioButtons } from '@lib/ui/components/RadioButtons';
import { Row } from '@lib/ui/components/Row';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { RadioButtonOption } from '@lib/ui/types/Input';
import { Theme } from '@lib/ui/types/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  ErrorCodes,
  State,
  ToothPicError,
  ToothPicSDK,
} from '@toothpic.eu/react-native-toothpic-sdk';

import { RTFTrans } from '~/core/components/RTFTrans';
import { ToothPicLogoPayoff } from '~/core/components/ToothPicLogo';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { useOpenInAppLink } from '~/core/hooks/useOpenInAppLink';
import { resetNavigationStatusTo } from '~/utils/navigation';
import { ApiError } from '~/utils/queries';
import { Sentry } from '~/utils/sentry';

import { BitString, ObjectIdentifier, Sequence } from 'asn1js';
// ts/linter does not complain without Buffer, but it's needed at runtime
import { Buffer } from 'buffer';

import {
  MFA_STATUS_QUERY_KEY,
  useMfaEnrol,
  useSSOLoginInitiator,
} from '../../../core/queries/authHooks';
import { generateSecp256k1KeyPair } from '../../../utils/crypto';
import {
  checkCanSavePrivateKeyMFA,
  savePrivateKeyMFA,
} from '../../../utils/keychain';
import { CircularProgress } from './CircularProgress';
import { IndeterminateCircularProgress } from './IndeterminateCircularProgress';
import { UserStackParamList } from './UserNavigator';

type Props = {
  navigation: NativeStackNavigationProp<UserStackParamList>;
};

type StorageType = 'system' | 'toothpic';

export const useControlledProgress = ({ delay = 200, step = 0.01 } = {}) => {
  const [progress, setProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);

  const isInProgress = progress < maxProgress;

  useEffect(() => {
    if (!isInProgress || maxProgress <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setProgress(prev => {
        const next = Math.round((prev + step) * 100) / 100;

        if (next >= maxProgress) {
          return maxProgress;
        }
        return next;
      });
    }, delay);

    return () => clearInterval(intervalId);
  }, [isInProgress, maxProgress, delay, step]);

  return { progress, setProgress, setMaxProgress };
};
export const MfaEnrollScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { mutateAsync: enrolMfa } = useMfaEnrol();
  const queryClient = useQueryClient();
  const handleSSO = useSSOLoginInitiator();
  const { setFeedback } = useFeedbackContext();
  const openInAppLink = useOpenInAppLink();
  const [step, setStep] = useState(0);
  const [storageType, setStorageType] = useState<StorageType | undefined>(
    'system',
  );
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'checking' | null
  >(null);
  const [progressMessage, setProgressMessage] = useState(
    t('mfaScreen.toothpic.capturingPhotons'),
  );
  const { progress, setProgress, setMaxProgress } = useControlledProgress();
  const [showIndeterminateProgressBar, setShowIndeterminateProgressBar] =
    useState(true);
  const [{ privateKey, publicKey }, setKeys] = useState(() =>
    generateSecp256k1KeyPair(),
  );
  const { politoAuthnEnrolmentStatus, updatePreference } =
    usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const deviceId = DeviceInfo.getDeviceNameSync();
  const [deviceName, setDeviceName] = useState(deviceId);
  const [isLoading, setIsLoading] = useState(false);
  const bottomBarHeight = useBottomTabBarHeight();
  const keyboard = useAnimatedKeyboard();
  const animatedBottomPadding = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, bottomBarHeight),
  }));
  const [showWarning, setShowWarning] = useState(false);
  const [isToothPicSupported, setIsToothPicSupported] = useState(false);
  const isAutoEnrollment =
    politoAuthnEnrolmentStatus?.inSettings === true &&
    politoAuthnEnrolmentStatus?.insertedDeviceName !== undefined &&
    politoAuthnEnrolmentStatus?.insertedDeviceName !== '';

  const onNo = useCallback(() => {
    updatePreference('politoAuthnEnrolmentStatus', {
      ...politoAuthnEnrolmentStatus,
      hideInitialPrompt: true,
    });
    navigation.goBack();
  }, [navigation, politoAuthnEnrolmentStatus, updatePreference]);

  const listenerSubscription = useRef<null | EventSubscription>(null);

  useEffect(() => {
    listenerSubscription.current = ToothPicSDK?.onProgress(state => {
      handleGenerationProgress(state);
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  });

  const executeEnrollment = useCallback(async () => {
    const dtoMfa = {
      description:
        politoAuthnEnrolmentStatus?.insertedDeviceName ??
        deviceName ??
        deviceId,
      pubkey: publicKey,
    };

    try {
      setIsLoading(true);
      const res = await enrolMfa(dtoMfa);
      const type = storageType === 'system' ? 'secp256k1' : 'toothpic';
      await savePrivateKeyMFA(res.serial, privateKey, type, {
        title: t('mfaScreen.biometricPrompt'),
      });
      await queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      setFeedback({
        text: t('mfaScreen.enroll.Success'),
        isPersistent: false,
      });
      if (politoAuthnEnrolmentStatus?.inSettings === true) {
        resetNavigationStatusTo(navigation, 'ProfileTab', [
          { name: 'Profile', params: { firstRequest: false } },
          { name: 'Settings' },
          { name: 'MfaSettings' },
        ]);
        updatePreference('politoAuthnEnrolmentStatus', {
          inSettings: false,
          insertedDeviceName: undefined,
          hideInitialPrompt: true,
          toothpicTempKeyID: undefined,
        });
      }
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.error === 'secureSessionExpired') {
          Alert.alert(t('common.warning'), t('mfaScreen.enroll.expired'), [
            {
              text: t('common.ok'),
              onPress: () => {
                updatePreference('politoAuthnEnrolmentStatus', {
                  ...politoAuthnEnrolmentStatus,
                  inSettings: true,
                  insertedDeviceName: deviceName,
                  hideInitialPrompt: false,
                });
                handleSSO(true);
              },
            },
          ]);
          return;
        } else {
          Alert.alert(t('common.error'), t('common.somethingWentWrong'));
        }
      } else {
        Alert.alert(t('common.error'), t('mfaScreen.enroll.saveFailure'));
      }
    }
    setIsLoading(false);
    navigation.goBack();
  }, [
    deviceName,
    deviceId,
    publicKey,
    enrolMfa,
    privateKey,
    t,
    queryClient,
    setFeedback,
    politoAuthnEnrolmentStatus,
    updatePreference,
    navigation,
    handleSSO,
    storageType,
  ]);

  const checkCameraPermission = useCallback(async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });
    if (!permission) return;

    try {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setCameraPermission('granted');
        return true;
      } else {
        setCameraPermission('denied');
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
      setCameraPermission('denied');
      return false;
    }
  }, [t, navigation]);

  const toothPicRegistration = useCallback(async () => {
    try {
      setProgressMessage(t('mfaScreen.toothpic.capturingPhotons'));
      setProgress(0.0);
      setMaxProgress(0.2);

      const generationData = await ToothPicSDK.generateCredential(
        true,
        true,
        true,
      );

      const keyID = generationData.keyID;
      const pubKey = generationData.publicKey;
      const subjectPublicKeyInfo = encodePublicKey(pubKey);

      setKeys({ privateKey: keyID, publicKey: subjectPublicKeyInfo });

      //store the ToothPic keyID. It could be used to resume the enrollment if the session expires
      updatePreference('politoAuthnEnrolmentStatus', {
        ...politoAuthnEnrolmentStatus,
        toothpicTempKeyID: keyID,
      });

      setStep(5);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(6);
    } catch (error: any) {
      setMaxProgress(0);

      if (error instanceof ToothPicError) {
        const errorCode = error.errorCode;
        const toothpicError = error.toString();
        const shootParameters = error.shootParameters;

        Sentry.captureMessage(
          'Generation error ' + toothpicError + ' ' + shootParameters,
          'warning',
        );
        var feedbackMessage = t('mfaScreen.toothpic.enrollFailed');

        if (errorCode === ErrorCodes.ERROR_INSUFFICIENT_LUMINOSITY) {
          feedbackMessage = t('mfaScreen.toothpic.uncoverTheCamera');
        }

        updatePreference('politoAuthnEnrolmentStatus', {
          ...politoAuthnEnrolmentStatus,
          hideInitialPrompt: true,
        });
        setFeedback({
          text: feedbackMessage,
          isPersistent: false,
        });
        navigation.goBack();
      }
    }
  }, [
    navigation,
    politoAuthnEnrolmentStatus,
    setFeedback,
    setMaxProgress,
    setProgress,
    t,
    updatePreference,
  ]);

  //Encode an EC public key as SubjectPublicKeyInfo
  const encodePublicKey = (uncompressedPublicKey: Uint8Array): string => {
    const pemOUT = (key: any) =>
      Buffer.from(key.toBER(false)).toString('base64');

    const publicKeyInfo = new Sequence({
      value: [
        new Sequence({
          value: [
            new ObjectIdentifier({ value: '1.2.840.10045.2.1' }),
            new ObjectIdentifier({ value: '1.2.840.10045.3.1.7' }),
          ],
        }),
        new BitString({
          unusedBits: 0,
          valueHex: uncompressedPublicKey.buffer as ArrayBuffer,
        }),
      ],
    });

    return pemOUT(publicKeyInfo);
  };

  //receive updates about the generation process
  const handleGenerationProgress = (state: State) => {
    switch (state) {
      case 'AUTOPARAMETER_GENERATION':
        setProgressMessage(t('mfaScreen.toothpic.analyzingFingerprint'));
        setProgress(0.2);
        setMaxProgress(0.6);
        break;
      case 'CAPTURE_COMPLETED_GENERATION':
        setProgress(0.6);
        setMaxProgress(0.99);
        setProgressMessage(t('mfaScreen.toothpic.creatingUnclonableKey'));
        break;
      case 'AUTOPARAMETER_VERIFICATION':
        setProgressMessage(t('mfaScreen.toothpic.verifyingUnclonableKey'));
        break;
      case 'DONE_VERIFICATION':
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

  const onYes = useCallback(async () => {
    if (step === 0) {
      setIsToothPicSupported(await ToothPicSDK.isPremiumSupported());

      if (!(await checkCanSavePrivateKeyMFA())) {
        Alert.alert(t('common.error'), t('mfaScreen.enroll.unsupported'));
        navigation.goBack();
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!storageType) return;
      if (storageType === 'system') {
        setKeys(generateSecp256k1KeyPair());
        setStep(5);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep(6);
      } else {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      setCameraPermission('checking');
      const granted = await checkCameraPermission();
      if (granted) {
        setStep(3);
      }
      return;
    }

    if (step === 3) {
      setStep(4);
      await toothPicRegistration();
    }

    if (step === 5) {
      setStep(6);
      return;
    }

    if (step === 6) {
      await executeEnrollment();
      return;
    }
  }, [
    step,
    storageType,
    t,
    navigation,
    executeEnrollment,
    checkCameraPermission,
    toothPicRegistration,
  ]);

  const goBack = useCallback(async () => {
    if (step === 2 || step === 3) {
      setStep(1);
      return;
    }
  }, [step]);

  useEffect(() => {
    if (isAutoEnrollment && step === 0) {
      setDeviceName(politoAuthnEnrolmentStatus.insertedDeviceName || deviceId);

      //continue the enrollment of a ToothPic key
      const keyID = politoAuthnEnrolmentStatus.toothpicTempKeyID;
      if (keyID) {
        (async () => {
          setStorageType('toothpic');
          //retrieve public key
          const pubKey = await ToothPicSDK.getPublicKey(keyID);
          const subjectPublicKeyInfo = encodePublicKey(pubKey);
          setKeys({ privateKey: keyID, publicKey: subjectPublicKeyInfo });
          setStep(6);
        })();
      } else {
        setStorageType('system');
        setStep(6);
      }
    }
  }, [
    isAutoEnrollment,
    step,
    politoAuthnEnrolmentStatus?.insertedDeviceName,
    politoAuthnEnrolmentStatus?.toothpicTempKeyID,
    executeEnrollment,
    deviceId,
  ]);

  if (step === 0) {
    return (
      <>
        <RTFTrans i18nKey="mfaScreen.enroll.prompt" style={styles.prompt} />
        <View style={styles.buttonsRow}>
          <CtaButton
            absolute={false}
            title={t('mfaScreen.enroll.cancel')}
            action={onNo}
            variant="outlined"
            style={styles.secondaryButton}
          />
          <CtaButton
            absolute={false}
            title={t('mfaScreen.enroll.confirm')}
            action={onYes}
            style={styles.primaryButton}
            loading={isLoading}
          />
        </View>
        <RTFTrans i18nKey="mfaScreen.enroll.note" style={styles.enrollNote} />
      </>
    );
  }

  if (step === 1) {
    const toothpicWebSite = 'www.toothpic.eu';
    const storageOptions: RadioButtonOption<StorageType>[] = [
      {
        key: 'system',
        title: t('mfaScreen.enroll.storageSelection.systemKeychain'),
        description: t(
          'mfaScreen.enroll.storageSelection.systemKeychainDescription',
        ),
      },
      {
        key: 'toothpic',
        title: t('mfaScreen.enroll.storageSelection.toothpic'),
        description: t('mfaScreen.enroll.storageSelection.toothpicDescription'),
      },
    ];

    return (
      <>
        <Text style={styles.storageTitle}>
          {t('mfaScreen.enroll.storageSelection.title')}
        </Text>
        <View style={styles.storageOptions}>
          <RadioButtons
            options={storageOptions}
            value={storageType}
            setValue={setStorageType}
          />
          {storageType === 'system' && (
            <Text style={styles.storageDescription}>
              {t('mfaScreen.enroll.storageSelection.systemKeyChainInfo')}
            </Text>
          )}
          {storageType === 'toothpic' && (
            <>
              <RTFTrans
                i18nKey="mfaScreen.enroll.storageSelection.toothpicInfo"
                style={styles.toothpicDescription}
              />
              {isToothPicSupported ? (
                <Text style={styles.toothpicDescription}>
                  {t('mfaScreen.toothpic.learnMore')}
                  <Text
                    style={styles.toothpicLink}
                    onPress={() => {
                      openInAppLink('https://' + toothpicWebSite);
                    }}
                  >
                    {toothpicWebSite}
                  </Text>
                </Text>
              ) : (
                <Text style={styles.toothpicUnsupported}>
                  {t('mfaScreen.toothpic.unsupported')}
                </Text>
              )}
            </>
          )}
        </View>
        <View style={styles.confirmButtonWrapper}>
          <CtaButton
            absolute={false}
            title={t('common.confirm')}
            action={onYes}
            disabled={
              !storageType ||
              (storageType === 'toothpic' && !isToothPicSupported)
            }
            loading={isLoading}
          />
        </View>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <RTFTrans
          i18nKey="mfaScreen.enroll.registration.startPrompt"
          style={styles.registrationPrompt}
        />
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
        <TouchableOpacity
          style={styles.cameraCard}
          onPress={onYes}
          disabled={cameraPermission === 'checking'}
        >
          <Icon icon={faCamera} size={24} />
          <View style={styles.cameraCardText}>
            <Text style={styles.cameraCardTitle}>
              {t('mfaScreen.enroll.registration.camera')}
            </Text>
            <Text style={styles.cameraCardSubtitle}>
              {cameraPermission === 'checking'
                ? '...'
                : t('mfaScreen.enroll.registration.cameraClickToAllow')}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraPermissionInfo')}
        </Text>
        <View style={{ flex: 1 }} />
        <Row gap={4} style={{ width: '100%' }}>
          <View style={{ flex: 1 }}>
            <CtaButton
              absolute={false}
              icon={faArrowLeft}
              variant="outlined"
              title=""
              action={goBack}
              loading={isLoading}
              containerStyle={{ paddingHorizontal: 0 }}
              style={{ borderRadius: 12 }}
            />
          </View>
          <View style={{ flex: 4 }}>
            <CtaButton
              absolute={false}
              title={t('mfaScreen.start')}
              disabled={cameraPermission !== 'granted'}
              action={onYes}
              loading={isLoading}
              containerStyle={{ paddingHorizontal: 0 }}
            />
          </View>
        </Row>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <RTFTrans
          i18nKey="mfaScreen.enroll.registration.startPrompt"
          style={styles.registrationPrompt}
        />
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
        <View style={styles.cameraCard}>
          <Icon icon={faCamera} size={24} />
          <View style={styles.cameraCardText}>
            <Text style={styles.cameraCardTitle}>
              {t('mfaScreen.enroll.registration.camera')}
            </Text>
            <View style={styles.cameraEnabledRow}>
              <Text style={styles.cameraCardSubtitle}>
                {t('mfaScreen.enroll.registration.cameraEnabled')}
              </Text>
            </View>
          </View>
          <Icon icon={faCheckCircle} size={18} color="#4CAF50" />
        </View>
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraPermissionInfo')}
        </Text>
        <View style={{ flex: 1 }} />
        <Row gap={4} style={{ width: '100%' }}>
          <View style={{ flex: 1 }}>
            <CtaButton
              containerStyle={{ paddingHorizontal: 0 }}
              icon={faArrowLeft}
              absolute={false}
              style={{ borderRadius: 12 }}
              variant="outlined"
              title=""
              action={goBack}
              loading={isLoading}
            />
          </View>
          <View style={{ flex: 4 }}>
            <CtaButton
              containerStyle={{ paddingHorizontal: 0 }}
              title={t('mfaScreen.start')}
              disabled={cameraPermission !== 'granted'}
              absolute={false}
              action={onYes}
              loading={isLoading}
            />
          </View>
        </Row>
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <Text style={styles.registrationInProgress}>
          {t('mfaScreen.enroll.registration.inProgress')}
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
              storageType === 'system' && styles.hidden,
            ]}
          />
        </View>
      </>
    );
  }

  if (step === 5) {
    return (
      <>
        <Text style={styles.registrationCompleted}>
          {t('mfaScreen.enroll.registration.completed')}
        </Text>
        <CircularProgress
          strokeWidth={16}
          progress={1}
          showCompletedIcon={true}
        />
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
              storageType === 'system' && styles.hidden,
            ]}
          />
        </View>
      </>
    );
  }

  if (step === 6) {
    return (
      <>
        <RTFTrans i18nKey="mfaScreen.enroll.devicePrompt" style={styles.note} />
        <Animated.View
          style={[
            { width: '100%', alignItems: 'center', paddingHorizontal: 10 },
            animatedBottomPadding,
          ]}
        >
          <Card padded={true} rounded={true} style={{ width: '100%' }}>
            <TextField
              accessible={true}
              label={t('mfaScreen.enroll.deviceName')}
              value={deviceName}
              onChangeText={setDeviceName}
              inputStyle={[styles.textFieldInput, { borderBottomWidth: 0 }]}
            />
          </Card>
          <View style={styles.confirmButtonWrapper}>
            <CtaButton
              absolute={false}
              title={t('common.confirm')}
              action={onYes}
              containerStyle={{ paddingHorizontal: 0 }}
              loading={isLoading}
              disabled={deviceName.length === 0}
            />
          </View>
        </Animated.View>
      </>
    );
  }

  return null;
};

export const createStyles = ({
  colors,
  spacing,
  palettes,
  dark,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    prompt: {
      fontSize: 16,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    subtitle: {
      fontSize: 16,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    buttonsRow: {
      flexDirection: 'row',
    },
    confirmButtonContainer: {
      width: '80%',
      alignSelf: 'center',
    },
    primaryButton: {
      backgroundColor: palettes.primary[500],
      borderColor: palettes.primary[500],
      width: spacing[40],
    },
    secondaryButton: {
      borderColor: palettes.primary[500],
      color: palettes.primary[500],
      width: spacing[40],
    },
    note: {
      fontSize: 15,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginTop: spacing[5],
      marginBottom: spacing[3],
      paddingHorizontal: spacing[5],
    },
    time: {
      fontWeight: 500,
      fontSize: 14,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginTop: spacing[5],
    },
    textFieldInput: {
      textAlign: 'center',
    },
    enrollNote: {
      fontSize: 16,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginTop: spacing[3],
      marginHorizontal: spacing[5],
    },
    storageItemTitle: {
      fontWeight: fontWeights.semibold,
    },
    storageTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: dark ? colors.white : palettes.primary[600],
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    storageOptions: {
      width: '100%',
      flex: 1,
    },
    storageDescription: {
      fontSize: 16,
      textAlign: 'center',
      color: dark ? colors.white : palettes.primary[600],
      marginTop: spacing[4],
      marginHorizontal: spacing[5],
    },
    toothpicDescription: {
      fontSize: 16,
      textAlign: 'center',
      color: dark ? colors.white : palettes.primary[600],
      marginTop: spacing[4],
      marginHorizontal: spacing[5],
    },
    toothpicLink: {
      color: palettes.primary[600],
      textDecorationLine: 'underline',
      fontWeight: fontWeights.semibold,
    },
    toothpicWebsite: {
      fontSize: 16,
      textAlign: 'center',
      color: palettes.primary[600],
      marginTop: spacing[4],
      marginHorizontal: spacing[5],
    },
    toothpicUnsupported: {
      fontSize: 16,
      textAlign: 'center',
      color: palettes.red[500],
      marginTop: spacing[4],
      marginHorizontal: spacing[5],
    },
    confirmButtonWrapper: {
      width: '100%',
    },
    registrationPrompt: {
      fontSize: 16,
      color: palettes.primary[600],
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    cameraInstruction: {
      fontSize: 14,
      color: palettes.primary[600],
      textAlign: 'center',
      marginTop: spacing[2],
      marginBottom: spacing[2],
    },
    cameraWarning: {
      fontSize: 14,
      marginTop: spacing[2],
      fontWeight: 'bold',
      color: palettes.red[500],
      textAlign: 'center',
    },
    hidden: {
      opacity: 0,
    },
    cameraCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: 16,
      marginBottom: spacing[4],
      marginTop: spacing[4],
    },
    cameraCardText: {
      marginLeft: spacing[4],
      flex: 1,
    },
    cameraCardTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: dark ? colors.white : colors.black,
      marginBottom: spacing[1],
    },
    cameraCardSubtitle: {
      fontSize: 14,
      color: palettes.muted[400],
    },
    cameraEnabledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    startButtonWrapper: {
      width: '100%',
      paddingHorizontal: spacing[5],
      marginTop: spacing[4],
    },
    registrationInProgress: {
      fontSize: 16,
      color: dark ? colors.white : palettes.primary[600],
      textAlign: 'center',
      marginBottom: spacing[6],
      marginHorizontal: spacing[5],
    },
    registrationCompleted: {
      fontSize: 16,
      color: dark ? colors.white : palettes.primary[600],
      textAlign: 'center',
      marginBottom: spacing[6],
      marginHorizontal: spacing[5],
    },
    completedIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: palettes.primary[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
    },
    containerLogo: {
      width: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toothpicLogoPayoff: {
      width: '60%',
      aspectRatio: 3,
      resizeMode: 'contain',
    },
  });
