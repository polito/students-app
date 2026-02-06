import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
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

import { faCamera, faCheck } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RadioGroup } from '@lib/ui/components/RadioGroup';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Option } from '@lib/ui/types/Input';
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
import { resetNavigationStatusTo } from '~/utils/navigation';
import { ApiError } from '~/utils/queries';

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
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (maxProgress === 0) {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        let next = prev + step;
        if (next >= maxProgress) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          return maxProgress;
        }
        next = Math.round(next * 100) / 100;
        return next;
      });
    }, delay) as unknown as number;

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [progress, maxProgress, delay, step]);

  return { progress, setProgress, setMaxProgress };
};

export const MfaEnrollScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { mutateAsync: enrolMfa } = useMfaEnrol();
  const queryClient = useQueryClient();
  const handleSSO = useSSOLoginInitiator();
  const { setFeedback } = useFeedbackContext();
  const [step, setStep] = useState(0);
  const [storageType, setStorageType] = useState<StorageType | undefined>();
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
    } catch (error: any) {
      setMaxProgress(0);

      if (error instanceof ToothPicError) {
        //Can be used for debug purposes
        //const toothpicError = error.toString()
        //const shootParameters = error.shootParameters;

        const errorCode = error.errorCode;
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
        setMaxProgress(0.9);
        setProgressMessage(t('mfaScreen.toothpic.creatingUnclonableKey'));
        break;
      case 'AUTOPARAMETER_VERIFICATION':
        setProgressMessage(t('mfaScreen.toothpic.verifyingUnclonableKey'));
        break;
      case 'CAPTURE_COMPLETED_VERIFICATION':
        setProgress(0.9);
        setMaxProgress(0.99);
        break;
      case 'DONE_VERIFICATION':
        setProgress(1.0);
        setMaxProgress(1.0);
        break;
      case 'PREVIEW_OK':
        setShowIndeterminateProgressBar(false);
        setFeedback(null);
        break;
      case 'PREVIEW_TOO_DARK':
        setShowIndeterminateProgressBar(true);
        setFeedback({
          text: t('mfaScreen.toothpic.uncoverTheCamera'),
          isPersistent: false,
        });
        break;
    }
  };

  const onYes = useCallback(async () => {
    if (step === 0) {
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
    const storageOptions: Option<StorageType>[] = [
      {
        label: t('mfaScreen.enroll.storageSelection.systemKeychain'),
        value: 'system',
      },
      {
        label: t('mfaScreen.enroll.storageSelection.toothpic'),
        value: 'toothpic',
      },
    ];

    return (
      <>
        <Text style={styles.storageTitle}>
          {t('mfaScreen.enroll.storageSelection.title')}
        </Text>
        <View style={styles.storageOptions}>
          <RadioGroup
            options={storageOptions}
            value={storageType}
            setValue={setStorageType}
          />
          {storageType === 'system' && (
            <Text style={styles.storageDescription}>
              {t('mfaScreen.enroll.storageSelection.systemKeychainDescription')}
            </Text>
          )}
          {storageType === 'toothpic' && (
            <>
              <Text style={styles.storageDescription}>
                {t('mfaScreen.enroll.storageSelection.toothpicDescription')}
              </Text>
              <RTFTrans
                i18nKey="mfaScreen.enroll.storageSelection.toothpicInfo"
                style={styles.toothpicInfo}
              />
            </>
          )}
        </View>
        <View style={styles.confirmButtonWrapper}>
          <CtaButton
            absolute={false}
            title={t('common.confirm')}
            action={onYes}
            disabled={!storageType}
            loading={isLoading}
          />
        </View>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <Text style={styles.registrationPrompt}>
          {t('mfaScreen.enroll.registration.startPrompt')}
        </Text>
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
        <View style={styles.startButtonWrapper}>
          <CtaButton
            absolute={false}
            title="START"
            action={onYes}
            disabled={cameraPermission === 'checking'}
            loading={cameraPermission === 'checking'}
          />
        </View>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <Text style={styles.registrationPrompt}>
          {t('mfaScreen.enroll.registration.startPrompt')}
        </Text>
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
              <Icon icon={faCheck} size={16} color="#4CAF50" />
            </View>
          </View>
        </View>
        <View style={styles.startButtonWrapper}>
          <CtaButton
            absolute={false}
            title="START"
            action={onYes}
            loading={isLoading}
          />
        </View>
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <Text style={styles.registrationInProgress}>{progressMessage}</Text>
        {showIndeterminateProgressBar ? (
          <IndeterminateCircularProgress />
        ) : (
          <CircularProgress
            progress={progress}
            text={`${Math.round(progress * 100)}` + '%'}
          />
        )}
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
        <ToothPicLogoPayoff style={styles.toothpicLogoPayoff} />
      </>
    );
  }

  if (step === 5) {
    return (
      <>
        <Text style={styles.registrationCompleted}>
          {t('mfaScreen.enroll.registration.completed')}
        </Text>
        <View style={styles.completedIcon}>
          <Icon icon={faCheck} size={64} color="#2196F3" />
        </View>
        <View style={styles.startButtonWrapper}>
          <CtaButton
            absolute={false}
            title={t('common.confirm')}
            action={onYes}
            loading={isLoading}
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
            { width: '100%', alignItems: 'center' },
            animatedBottomPadding,
          ]}
        >
          <View style={{ width: '80%', alignItems: 'center' }}>
            <OverviewList style={styles.sectionList} accessible={false}>
              <TextField
                accessible={true}
                label={t('mfaScreen.enroll.deviceName')}
                value={deviceName}
                onChangeText={setDeviceName}
                inputStyle={styles.textFieldInput}
              />
            </OverviewList>
          </View>
          <View style={{ width: '80%', alignItems: 'center' }}>
            <CtaButton
              absolute={false}
              title={t('common.confirm')}
              action={onYes}
              containerStyle={styles.confirmButtonContainer}
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

export const createStyles = ({ colors, spacing, palettes, dark }: Theme) =>
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
      minWidth: Dimensions.get('window').width,
    },
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
    enrollNote: {
      fontSize: 16,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginTop: spacing[3],
      marginHorizontal: spacing[5],
    },
    storageTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginBottom: spacing[6],
      marginHorizontal: spacing[5],
    },
    storageOptions: {
      width: '100%',
      marginBottom: spacing[6],
    },
    storageDescription: {
      fontSize: 14,
      color: dark ? colors.white : colors.black,
      marginTop: spacing[2],
      marginHorizontal: spacing[5],
      paddingLeft: spacing[10],
    },
    toothpicInfo: {
      fontSize: 14,
      color: palettes.primary[600],
      marginTop: spacing[3],
      marginHorizontal: spacing[5],
      paddingLeft: spacing[10],
    },
    confirmButtonWrapper: {
      width: '100%',
      paddingHorizontal: spacing[5],
      marginTop: spacing[4],
    },
    registrationPrompt: {
      fontSize: 16,
      fontWeight: '600',
      color: palettes.primary[600],
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    cameraInstruction: {
      fontSize: 14,
      color: palettes.primary[600],
      textAlign: 'center',
      marginTop: spacing[4],
      marginBottom: spacing[3],
      marginHorizontal: spacing[5],
    },
    cameraCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: 8,
      marginHorizontal: spacing[5],
      marginBottom: spacing[6],
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
      color: colors.heading,
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
      minHeight: 40,
      color: dark ? colors.white : colors.black,
      textAlign: 'center',
      marginBottom: spacing[6],
      marginHorizontal: spacing[5],
    },
    registrationCompleted: {
      fontSize: 16,
      color: dark ? colors.white : colors.black,
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
    toothpicLogoPayoff: {
      width: '60%',
      height: 100,
      resizeMode: 'contain',
    },
  });
