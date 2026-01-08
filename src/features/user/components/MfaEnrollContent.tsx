import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
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

import { RTFTrans } from '~/core/components/RTFTrans';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { resetNavigationStatusTo } from '~/utils/navigation';
import { ApiError } from '~/utils/queries';

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
import { UserStackParamList } from './UserNavigator';

type Props = {
  navigation: NativeStackNavigationProp<UserStackParamList>;
};

type StorageType = 'system' | 'toothpic';

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
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const { publicKey, privateKey } = generateSecp256k1KeyPair();
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
      await savePrivateKeyMFA(res.serial, privateKey, {
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

  const simulateRegistration = useCallback(async () => {
    setRegistrationProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setRegistrationProgress(i / 100);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    setStep(5);
  }, []);

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
      await simulateRegistration();
      return;
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
    simulateRegistration,
  ]);

  useEffect(() => {
    if (isAutoEnrollment && step === 0) {
      setDeviceName(politoAuthnEnrolmentStatus.insertedDeviceName || deviceId);
      setStorageType('system');
      setStep(6);
      executeEnrollment();
    }
  }, [
    isAutoEnrollment,
    step,
    politoAuthnEnrolmentStatus?.insertedDeviceName,
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
        <Text style={styles.registrationInProgress}>
          {t('mfaScreen.enroll.registration.inProgress')}
        </Text>
        <CircularProgress
          progress={registrationProgress}
          size={200}
          text={t('mfaScreen.enroll.registration.verifyingKey')}
        />
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
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
        <Text style={styles.cameraInstruction}>
          {t('mfaScreen.enroll.registration.cameraInstruction')}
        </Text>
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
  });
