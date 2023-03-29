import { useTranslation } from 'react-i18next';
import { StyleSheet, ViewProps } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { Attachment } from '../types/Attachment';

interface AttachmentChipProps {
  attachment?: Attachment;
  onClearAttachment?: () => void;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewProps['style'];
}

export const AttachmentChip = ({
  attachment,
  onClearAttachment,
  loading = false,
  fullWidth = false,
  style,
}: AttachmentChipProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  if (!attachment) {
    return null;
  }

  return (
    <Row align="center" style={[styles.attachmentContainer, style]}>
      {!loading ? (
        <Icon icon={faFile} style={styles.space} size={18} />
      ) : (
        <ActivityIndicator style={styles.space} />
      )}
      <Text
        numberOfLines={1}
        ellipsizeMode="middle"
        style={[
          styles.name,
          !!onClearAttachment && styles.space,
          !fullWidth && { maxWidth: 200 },
        ]}
      >
        {attachment.name ?? t('common.unnamedFile')}
      </Text>
      {!!onClearAttachment && (
        <IconButton
          icon={faTimes}
          onPress={onClearAttachment}
          style={styles.cancelButton}
        />
      )}
    </Row>
  );
};

const createStyles = ({
  colors,
  shapes,
  spacing,
  fontSizes,
  fontWeights,
}: Theme) => {
  return StyleSheet.create({
    attachmentContainer: {
      overflow: 'hidden',
      backgroundColor: colors.translucentSurface,
      borderRadius: shapes.xl,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1.5],
    },
    name: {
      fontWeight: fontWeights.semibold,
    },
    cancelButton: {
      padding: spacing[1],
      backgroundColor: colors.translucentSurface,
      borderRadius: shapes.xl,
      marginRight: -spacing[1.5],
    },
    space: {
      marginRight: spacing[2],
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
    },
  });
};
