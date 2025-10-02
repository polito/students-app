import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RTFTrans } from '~/core/components/RTFTrans';
import { usePreferencesContext } from '~/core/contexts/PreferencesContext';
import { useCheckMfa, useLogout } from '~/core/queries/authHooks';
import { hasPrivateKeyMFA } from '~/utils/keychain';

import { UserStackParamList } from './UserNavigator';

export const MfaSettings = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontSizes, palettes, colors, spacing } = useTheme();
  const { data: mfa } = useCheckMfa(true);
  const { mutate: logout } = useLogout();
  const { politoAuthnEnrolmentStatus, updatePreference } =
    usePreferencesContext();
  const [hasLocalMfaKey, setHasLocalMfaKey] = useState<boolean>(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    hasPrivateKeyMFA().then(res => setHasLocalMfaKey(res));
  }, [mfa]);

  const buttonHeight = spacing[4] + bottom;

  const getStatusText = () => {
    if (mfa?.status === 'available' || mfa?.status === 'needsReauth') {
      return t('mfaScreen.settings.disabled');
    }
    if (hasLocalMfaKey) {
      return t('mfaScreen.settings.active');
    }
    return t('common.error');
  };

  const renderErrorBlock = (i18nKey: string) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorLabel}>{t('mfaScreen.settings.textError')}</Text>
      <View style={styles.errorTextContainer}>
        <RTFTrans
          style={[
            styles.text,
            {
              fontSize: fontSizes.md,
              color: colors.longProse,
              marginLeft: spacing[5],
            },
          ]}
          i18nKey={i18nKey}
        />
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ marginBottom: buttonHeight }}
      >
        <View style={styles.container}>
          <Section>
            <SectionHeader title={t('mfaScreen.settings.details')} />
            <OverviewList indented>
              <ListItem
                title={t('mfaScreen.settings.status')}
                trailingItem={
                  <Text style={styles.infoValue}>{getStatusText()}</Text>
                }
              />
              {mfa?.status !== 'locked' &&
                (hasLocalMfaKey ||
                  mfa?.status === 'available' ||
                  mfa?.status === 'needsReauth') && (
                  <>
                    <ListItem
                      title={t('common.enroll.serial')}
                      trailingItem={
                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color: !mfa?.details?.serial
                                ? palettes.gray[400]
                                : colors.longProse,
                            },
                          ]}
                        >
                          {mfa?.details?.serial ?? t('mfaScreen.settings.none')}
                        </Text>
                      }
                    />
                    <ListItem
                      title={t('mfaScreen.enroll.deviceName')}
                      trailingItem={
                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color: !mfa?.details?.description
                                ? palettes.gray[400]
                                : colors.longProse,
                            },
                          ]}
                        >
                          {mfa?.details?.description ??
                            t('mfaScreen.settings.notSet')}
                        </Text>
                      }
                    />
                  </>
                )}
              {mfa?.status === 'locked' &&
                renderErrorBlock('mfaScreen.settings.lockedDescription')}
              {mfa?.status !== 'locked' &&
                mfa?.status !== 'active' &&
                mfa?.status !== 'available' &&
                mfa?.status !== 'needsReauth' &&
                renderErrorBlock('mfaScreen.settings.notAccessible')}
              {mfa?.status === 'active' &&
                !hasLocalMfaKey &&
                renderErrorBlock('mfaScreen.settings.notAccessible')}
            </OverviewList>
          </Section>

          <Section>
            <SectionHeader title={t('mfaScreen.settings.information')} />
            <OverviewList indented>
              <View style={styles.content} accessible>
                <RTFTrans
                  style={[styles.text, { fontSize: fontSizes.md }]}
                  i18nKey="mfaScreen.settings.description"
                />
              </View>
            </OverviewList>
          </Section>
        </View>
      </ScrollView>
      {((mfa?.status !== 'active' && mfa?.status !== 'locked') ||
        (mfa?.status === 'active' && !hasLocalMfaKey)) && (
        <View style={styles.buttonContainer}>
          <CtaButton
            title={
              mfa?.status === 'available' || mfa?.status === 'needsReauth'
                ? t('mfaScreen.settings.enableNow')
                : t('mfaScreen.settings.correctError')
            }
            action={() => {
              updatePreference('politoAuthnEnrolmentStatus', {
                ...politoAuthnEnrolmentStatus,
                inSettings: true,
              });
              if (
                mfa?.status === 'available' ||
                mfa?.status === 'needsReauth'
              ) {
                navigation.navigate({
                  name: 'ProfileTab',
                  params: {
                    screen: 'PolitoAuthenticator',
                    params: {
                      activeView: 'enroll',
                    },
                  },
                });
              } else {
                logout();
              }
            }}
            variant="filled"
            absolute={false}
            containerStyle={
              [styles.buttonWrapper, { top: -spacing[16] - bottom }] as any
            }
          />
        </View>
      )}
    </>
  );
};
const createStyles = ({ dark, colors, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: dark ? colors.surfaceDark : colors.background,
      paddingVertical: spacing[2],
    },
    content: {
      padding: spacing[7],
      gap: spacing[4],
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: spacing['1'],
    },
    text: {
      flexDirection: 'column',
      color: colors.longProse,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
    },
    errorLabel: {
      fontSize: fontSizes.md,
      color: colors.longProse,
      marginRight: spacing[4],
      minWidth: 80,
    },
    errorTextContainer: {
      flex: 1,
      paddingLeft: 9,
    },
    formula: {
      marginTop: spacing[1],
    },
    bold: {
      fontWeight: 'bold',
    },
    buttonContainer: {
      margin: spacing[2],
    },
    buttonWrapper: {
      padding: 0,
      elevation: 0,
    },
    infoValue: {
      color: colors.longProse,
      fontWeight: 'bold',
    },
  });
