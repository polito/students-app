import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MfaStatusResponse } from '@polito/api-client';
import { useNavigation } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RTFTrans } from '~/core/components/RTFTrans';

import { UserStackParamList } from './UserNavigator';

type MfaStatus = {
  mfa?: MfaStatusResponse;
  localMfaKey?: boolean;
};
export const MfaSettings = ({ mfa, localMfaKey }: MfaStatus) => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  return (
    <OverviewList indented>
      <ListItem
        title={t('settingsScreen.authenticatorTitle')}
        subtitle=""
        leadingItem={<Icon icon={faShieldHalved} size={20} />}
        trailingItem={
          mfa?.status !== 'active' ? (
            <CtaButton
              title="Enable"
              style={{ elevation: 0 }}
              absolute={false}
              action={() =>
                navigation.navigate('ProfileTab', {
                  screen: 'PolitoAuthenticator',
                  params: {
                    activeView: 'enroll',
                  },
                })
              }
            ></CtaButton>
          ) : localMfaKey ? (
            <Badge
              backgroundColor={palettes.success[500]}
              foregroundColor={palettes.success[100]}
              text={t('common.enabled')}
            />
          ) : (
            <Badge
              backgroundColor={palettes.error[500]}
              foregroundColor={palettes.error[100]}
              text={t('common.error')}
            />
          )
        }
      />
    </OverviewList>
  );
};

export const MfaModal = ({
  title,
  onDismiss,
  mfa,
  hasLocalMfaKey,
}: {
  title: string;
  onDismiss: () => void;
  mfa: any;
  hasLocalMfaKey?: boolean;
}) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { details, status } = mfa;
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  return (
    <ModalContent close={onDismiss} title={title}>
      <View style={styles.content} accessible>
        {details && hasLocalMfaKey && (
          <>
            <Text>{t('common.enroll.serial') + ': '}</Text>
            <Text>{details.serial}</Text>
            <Text>{t('common.enroll.device') + ': '}</Text>
            <Text>{details.description}</Text>
          </>
        )}
        <RTFTrans
          style={styles.text}
          i18nKey={
            status === 'available' ||
            ((status === 'active' || status === 'available') && hasLocalMfaKey)
              ? 'mfaScreen.settings.description'
              : 'mfaScreen.settings.notAccessible'
          }
        />
        {!hasLocalMfaKey && mfa.status === 'active' && (
          <CtaButton
            title={t('common.correct')}
            style={{ elevation: 0 }}
            absolute={false}
            action={() => {
              onDismiss();
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
          ></CtaButton>
        )}
      </View>
    </ModalContent>
  );
};

const createStyles = ({ dark, colors, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
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
    listItemTitle: {
      fontWeight: '600',
    },
    text: {
      flexDirection: 'column',
      color: colors.longProse,
    },
    formula: {
      marginTop: spacing[1],
    },
    bold: {
      fontWeight: 'bold',
    },
  });
