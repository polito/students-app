import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

type Props = {
  action: () => void;
};

export const CreateTicketCta = ({ action }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.action}>
      <Text style={styles.noResultFound} variant={'prose'}>
        {t('ticketFaqsScreen.noResultFound')}
      </Text>
      <CtaButton
        adjustInsets={false}
        absolute={false}
        title={t('ticketFaqsScreen.writeTicket')}
        action={action}
        icon={faPencil}
      />
    </View>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    noResultFound: {
      textAlign: 'center',
      color: colors.text['100'],
    },
    scrollViewStyle: {
      justifyContent: 'space-between',
      height: '100%',
    },
    action: {
      display: 'flex',
      flexDirection: 'column',
      flex: 0,
    },
  });
