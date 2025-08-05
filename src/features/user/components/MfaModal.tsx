import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ModalContent } from '@lib/ui/components/ModalContent';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { RTFTrans } from '~/core/components/RTFTrans';

export const MfaModal = ({
  title,
  onDismiss,
  mfa,
}: {
  title: string;
  onDismiss: () => void;
  mfa: any;
}) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { details } = mfa;
  return (
    <ModalContent close={onDismiss} title={title}>
      <View style={styles.content} accessible>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('common.enroll.serial') + ' : ' + details.serial}
        </Text>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('common.enroll.device') + ' : ' + details.description}
        </Text>
        <Text style={styles.headerTitle} accessibilityRole="header">
          <RTFTrans
            i18nKey="mfaScreen.description"
            style={styles.headerTitle}
          />
        </Text>
      </View>
    </ModalContent>
  );
};

const createStyles = ({ dark, fontSizes, colors, spacing }: Theme) =>
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
    headerTitle: {
      fontSize: fontSizes.lg,
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
    },
    formula: {
      marginTop: spacing[1],
    },
  });
