import { useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';

import { RTFTrans } from '~/core/components/RTFTrans';
import { useFeedbackContext } from '~/core/contexts/FeedbackContext';
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

export const MfaEnrollScreen = () => {
  const { t } = useTranslation();
  const { mutateAsync: enrolMfa, isPending } = useMfaEnrol();
  const queryClient = useQueryClient();
  const handleSSO = useSSOLoginInitiator();
  const { setFeedback } = useFeedbackContext();
  const [step, setStep] = useState(0);
  const { publicKey, privateKey } = generateSecp256k1KeyPair();
  const navigation = useNavigation();
  const styles = useStylesheet(createStyles);
  const deviceId = DeviceInfo.getDeviceNameSync();
  const [deviceName, setDeviceName] = useState(deviceId);
  const bottomBarHeight = useBottomTabBarHeight();
  const keyboard = useAnimatedKeyboard();
  const animatedBottomPadding = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, bottomBarHeight),
  }));
  const onNo = () => {
    navigation.goBack();
    queryClient.setQueryData(MFA_STATUS_QUERY_KEY, undefined);
  };

  const onYes = async () => {
    const dtoMfa = { description: deviceName ?? deviceId, pubkey: publicKey };

    try {
      if (step === 0) {
        if (!(await checkCanSavePrivateKeyMFA())) {
          Alert.alert(t('common.error'), t('mfaScreen.enroll.unsupported'));
          navigation.goBack();
          return;
        }
        setStep(s => s + 1);
        return;
      }
      const res = await enrolMfa(dtoMfa);
      await savePrivateKeyMFA(res.serial, privateKey, {
        title: t('mfaScreen.biometricPrompt'),
      });
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
      setFeedback({
        text: t('mfaScreen.enroll.Success'),
        isPersistent: false,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.error === 'secureSessionExpired') {
          Alert.alert(t('common.error'), t('mfaScreen.enroll.expired'), [
            { text: t('common.ok'), onPress: () => handleSSO(true) },
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
  };
  if (step === 0)
    return (
      <>
        <RTFTrans
          i18nKey="mfaScreen.enroll.prompt"
          style={[
            styles.subtitle,
            {
              height: step > 0 ? 0 : undefined,
            },
          ]}
        />
        <RTFTrans
          i18nKey="mfaScreen.enroll.devicePrompt"
          style={styles.subtitle}
        />
        <View style={[styles.buttonsRow, { justifyContent: 'space-between' }]}>
          <CtaButton
            absolute={false}
            title={t('mfaScreen.enroll.cancel')}
            action={onNo}
            variant="outlined"
            containerStyle={styles.secondaryButtonContainer}
            style={styles.secondaryButton}
          />
          <CtaButton
            absolute={false}
            title={t('mfaScreen.enroll.confirm')}
            action={onYes}
            containerStyle={styles.primaryButtonContainer}
            style={styles.primaryButton}
            loading={isPending}
          />
        </View>
      </>
    );
  else
    return (
      <>
        <RTFTrans i18nKey="mfaScreen.enroll.note" style={styles.note} />
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
              loading={isPending}
              disabled={deviceName.length === 0}
            />
          </View>
        </Animated.View>
      </>
    );
};

export const createStyles = ({ colors, spacing, palettes }: Theme) =>
  StyleSheet.create({
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
      width: '100%',
    },
    primaryButtonContainer: {
      flex: 1,
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
    secondaryButtonContainer: {
      flex: 1,
      gap: 8,
    },
    secondaryButton: {
      borderColor: palettes.primary[500],
      color: palettes.primary[500],
      width: spacing[40],
    },
    note: {
      fontSize: 15,
      color: colors.caption,
      textAlign: 'center',
      marginTop: spacing[5],
      paddingHorizontal: spacing[5],
    },
    time: {
      fontWeight: 500,
      fontSize: 14,
      color: colors.caption,
      textAlign: 'center',
      marginTop: spacing[5],
    },
    textFieldInput: {
      textAlign: 'center',
      minWidth: Dimensions.get('window').width - spacing[4],
    },
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
  });
