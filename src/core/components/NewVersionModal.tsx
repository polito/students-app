import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

type Props = {
  close: () => void;
  newVersion: string;
  url: string;
  source: 'store' | 'github';
};

export const NewVersionModal = ({ close, newVersion, url, source }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  return (
    <ModalContent title={t('common.newVersionTitle')} close={close}>
      <View style={styles.content}>
        <Text variant="prose" style={styles.text}>
          {t('common.newVersionBody', { newVersion })}
        </Text>
        <CtaButton
          tkey={
            source === 'store'
              ? 'common.goToStore'
              : source === 'github'
                ? 'common.goToGithub'
                : ''
          }
          action={() => Linking.openURL(url)}
          absolute={false}
        />
      </View>
    </ModalContent>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    content: {
      padding: spacing[4],
    },
    text: {
      marginHorizontal: spacing[4],
      marginBottom: spacing[4],
    },
    version: {
      textDecorationLine: 'underline',
    },
  });
