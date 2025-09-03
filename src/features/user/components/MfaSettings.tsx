import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MfaStatusResponse } from '@polito/api-client';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RTFTrans } from '~/core/components/RTFTrans';

import { UserStackParamList } from './UserNavigator';

type MfaStatus = {
  mfa?: MfaStatusResponse;
  localMfaKey?: boolean;
  hasLocalMfaKey?: boolean;
};
export const MfaSettings = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontSizes, palettes, colors, spacing } = useTheme();
  const route = useRoute();
  const { mfa, hasLocalMfaKey } = route.params as MfaStatus;
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  const buttonHeight = spacing[4];

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
                  <Text style={styles.infoValue}>
                    {mfa?.status === 'available'
                      ? t('mfaScreen.settings.disabled')
                      : hasLocalMfaKey
                        ? t('mfaScreen.settings.active')
                        : t('common.error')}
                  </Text>
                }
              />
              {(mfa?.status === 'available' ||
                (mfa?.status === 'active' && hasLocalMfaKey)) && (
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
                    title={t('common.enroll.device')}
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
              {!(
                mfa?.status === 'available' ||
                (mfa?.status === 'active' && hasLocalMfaKey)
              ) && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorLabel}>
                    {t('mfaScreen.settings.textError')}
                  </Text>
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
                      i18nKey="mfaScreen.settings.notAccessible"
                    />
                  </View>
                </View>
              )}
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
      {mfa?.status !== 'active' && (
        <View style={styles.buttonContainer}>
          <CtaButton
            title={
              mfa?.status === 'available'
                ? t('mfaScreen.settings.enableNow')
                : t('mfaScreen.settings.correctError')
            }
            action={() => {
              navigation.navigate({
                name: 'ProfileTab',
                params: {
                  screen: 'PolitoAuthenticator',
                  params: {
                    activeView: 'enroll',
                  },
                },
              });
            }}
            variant="filled"
            absolute={false}
            containerStyle={styles.buttonWrapper}
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
      margin: spacing[4],
    },
    buttonWrapper: {
      padding: 0,
      top: -spacing[20],
      elevation: 0,
    },
    infoValue: {
      color: colors.longProse,
    },
  });
