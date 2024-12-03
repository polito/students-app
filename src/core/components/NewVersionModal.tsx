import { Trans, useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { ModalContent } from '@lib/ui/components/ModalContent';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

type Props = {
  close: () => void;
  newVersion: string;
  storeUrl: string;
};

export const NewVersionModal = ({ close, newVersion, storeUrl }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  return (
    <ModalContent title={t('common.newVersionTitle')} close={close}>
      <View style={styles.content}>
        <Text variant="prose" style={styles.text}>
          <Trans
            i18nKey="common.newVersionBody"
            values={{ newVersion }}
            components={[
              <Text
                key="storeLink"
                onPress={() => Linking.openURL(storeUrl)}
                style={styles.version}
              />,
            ]}
          />
        </Text>
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
      marginBottom: spacing[10],
    },
    version: {
      textDecorationLine: 'underline',
    },
  });
