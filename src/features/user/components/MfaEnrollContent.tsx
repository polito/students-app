import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { RTFTrans } from '~/core/components/RTFTrans';
import { ApiError } from '~/utils/queries';

import {
  MFA_STATUS_QUERY_KEY,
  useMfaEnrol,
  useSSOLoginInitiator,
} from '../../../core/queries/authHooks';
import { generateSecp256k1KeyPair } from '../../../utils/crypto';
import { savePrivateKeyMFA } from '../../../utils/keychain';

export const MfaEnrollScreen = () => {
  const { t } = useTranslation();
  const { mutateAsync: enrolMfa, isPending } = useMfaEnrol();
  const queryClient = useQueryClient();
  const handleSSO = useSSOLoginInitiator();

  const { publicKey, privateKey } = generateSecp256k1KeyPair();

  const navigation = useNavigation();
  const styles = useStylesheet(createStyles);
  const onNo = () => {
    navigation.goBack();
    queryClient.setQueryData(MFA_STATUS_QUERY_KEY, undefined);
  };

  const onYes = async () => {
    const deviceId = DeviceInfo.getDeviceId();
    const dtoMfa = { description: deviceId, pubkey: publicKey };

    try {
      const res = await enrolMfa(dtoMfa);
      await savePrivateKeyMFA(res.serial, privateKey, {
        title: t('mfaScreen.biometricPrompt'),
      });
      queryClient.invalidateQueries({ queryKey: MFA_STATUS_QUERY_KEY });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.error === 'secureSessionExpired') {
          Alert.alert(t('common.error'), t('mfaScreen.enroll.expired'), [
            { text: t('common.ok'), onPress: () => handleSSO(true) },
          ]);
          return;
        }
      }
      Alert.alert(t('common.error'), t('mfaScreen.enroll.failure'));
    }
    navigation.goBack();
  };

  return (
    <>
      <RTFTrans i18nKey="mfaScreen.enroll.prompt" style={styles.subtitle} />

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

      <RTFTrans i18nKey="mfaScreen.enroll.note" style={styles.note} />
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
  });
