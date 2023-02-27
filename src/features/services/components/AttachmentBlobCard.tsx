import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { formatFileSize } from '../../../utils/files';

interface AttachmentCardProps {
  attachment?: Blob;
  onPressCancelAttachment?: () => void;
}

export const AttachmentBlobCard = ({
  attachment,
  onPressCancelAttachment,
}: AttachmentCardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!attachment) {
    return <View />;
  }

  return (
    <Row noFlex style={styles.attachmentContainer}>
      <Icon icon={faFile} size={35} />
      <Col noFlex flexStart>
        <Text numberOfLines={1} style={styles.name}>
          {attachment?._data?.name}
        </Text>
        <Text numberOfLines={1} style={styles.size}>
          {formatFileSize(attachment?._data?.size / 1000, 0)}
        </Text>
      </Col>
      {!!onPressCancelAttachment && (
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={onPressCancelAttachment}
        >
          <Icon icon={faTimes} size={12} color={'white'} />
        </TouchableOpacity>
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
}: Theme) =>
  StyleSheet.create({
    attachmentContainer: {
      borderRadius: shapes.lg * 1.5,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: spacing[2],
      paddingBottom: spacing[2],
      paddingTop: spacing[5],
      paddingRight: spacing[6],
      marginRight: spacing[3],
    },
    deleteIcon: {
      position: 'absolute',
      top: spacing[1],
      right: spacing[2],
      backgroundColor: colors.error[500],
      borderRadius: 50,
      width: spacing[4],
      height: spacing[4],
      padding: spacing[1],
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      maxWidth: +spacing[10] * 2,
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
    },
  });
