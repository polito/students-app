import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

interface AttachmentCardProps {
  attachment?: Blob;
  onPressCancelAttachment?: () => void;
}

export const AttachmentBlobCard = ({
  attachment,
  onPressCancelAttachment,
}: AttachmentCardProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  if (!attachment) {
    return null;
  }

  return (
    <Row noFlex alignCenter style={styles.attachmentContainer}>
      <Icon icon={faFile} style={[styles.space, styles.opacity]} />
      <Text
        numberOfLines={1}
        style={[styles.name, styles.opacity, styles.space]}
      >
        {(attachment as unknown as { _data?: { name: string } })._data?.name ??
          t('ticketScreen.unnamedFile')}
      </Text>
      {!!onPressCancelAttachment && (
        <IconButton
          icon={faTimes}
          onPress={onPressCancelAttachment}
          style={styles.cancelButton}
          iconStyle={styles.opacity}
        />
      )}
    </Row>
  );
};

const createStyles = ({ shapes, spacing, fontSizes, fontWeights }: Theme) => {
  return StyleSheet.create({
    attachmentContainer: {
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, .1)',
      borderRadius: shapes.xl,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1.5],
      marginRight: spacing[3],
    },
    name: {
      maxWidth: spacing[32],
      marginRight: spacing[2],
      fontWeight: fontWeights.semibold,
    },
    cancelButton: {
      padding: spacing[1],
      backgroundColor: 'rgba(0, 0, 0, .1)',
      borderRadius: shapes.xl,
      marginRight: -spacing[1.5],
    },
    space: {
      marginRight: spacing[2],
    },
    opacity: {
      opacity: Platform.select({ ios: 0.8 }),
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
    },
  });
};
