import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Platform, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { RTFTrans } from '~/core/components/RTFTrans';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
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
import { UserStackParamList } from './UserNavigator';

export const MfaEnrollScreen = () => {
  const { t } = useTranslation();
  const { mutateAsync: enrolMfa } = useMfaEnrol();
  const queryClient = useQueryClient();
  const handleSSO = useSSOLoginInitiator();
  const { setFeedback } = useFeedbackContext();
  const [step, setStep] = useState(0);
  const { publicKey, privateKey } = generateSecp256k1KeyPair();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
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
    const dtoMfa = { description: deviceName ?? deviceId, pubkey: publicKey };

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
        navigation.navigate('ProfileTab');
        requestAnimationFrame(() => {
          navigation.navigate('ProfileTab', {
            screen: 'Settings',
          });
          requestAnimationFrame(() => {
            navigation.navigate('ProfileTab', {
              screen: 'MfaSettings',
            });
          });
        });
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
          Alert.alert(t('common.error'), t('mfaScreen.enroll.expired'), [
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
    navigation.goBack();
    setIsLoading(false);
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

  const onYes = useCallback(async () => {
    if (step === 0) {
      if (!(await checkCanSavePrivateKeyMFA())) {
        Alert.alert(t('common.error'), t('mfaScreen.enroll.unsupported'));
        navigation.goBack();
        return;
      }
      setStep(s => s + 1);
      return;
    }

    await executeEnrollment();
  }, [step, t, navigation, executeEnrollment]);

  useEffect(() => {
    if (isAutoEnrollment && step === 0) {
      setDeviceName(politoAuthnEnrolmentStatus.insertedDeviceName || deviceId);
      setStep(1);
      executeEnrollment();
    }
  }, [
    isAutoEnrollment,
    step,
    politoAuthnEnrolmentStatus?.insertedDeviceName,
    executeEnrollment,
    deviceId,
  ]);

  if (step === 0)
    return (
      <>
        <RTFTrans
          i18nKey="mfaScreen.enroll.prompt"
          style={[
            styles.prompt,
            {
              height: step > 0 ? 0 : undefined,
            },
          ]}
        />
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
  else
    return (
      <>
        <RTFTrans i18nKey="mfaScreen.enroll.devicePrompt" style={styles.note} />
        <Animated.View
          style={[
            { width: '100%', alignItems: 'center' },
            animatedBottomPadding,
          ]}
        >
          {/* TextField centrato e largo l'80% */}
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
      color: colors.caption,
      textAlign: 'center',
      marginBottom: spacing[4],
      marginHorizontal: spacing[5],
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
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
  });
