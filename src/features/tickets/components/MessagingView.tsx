import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View, ViewProps } from 'react-native';
import { openCamera, openPicker } from 'react-native-image-crop-picker';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { pick, types } from '@react-native-documents/picker';
import { MenuView } from '@react-native-menu/menu';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { pdfSizes } from '../../courses/constants';
import { Attachment } from '../../services/types/Attachment';
import { AttachmentChip } from './AttachmentChip';

interface Props extends ViewProps {
  message?: string;
  onMessageChange?: (message: string) => void;
  onSend?: () => void;
  attachment?: Attachment;
  onAttachmentChange: (attachment?: Attachment) => void;
  loading?: boolean;
  disabled?: boolean;
  showSendButton?: boolean;
  translucent?: boolean;
  numberOfLines?: number;
  textFieldStyle?: ViewProps['style'];
}

export const MessagingView = ({
  message,
  onMessageChange,
  onSend,
  attachment,
  onAttachmentChange,
  loading = false,
  disabled = false,
  showSendButton = true,
  translucent = true,
  numberOfLines = 1,
  textFieldStyle,
  ...props
}: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const fileTypes = [
    types.pdf,
    types.images,
    types.video,
    types.zip,
    types.doc,
    types.docx,
    types.xlsx,
    types.xls,
  ];
  const { setFeedback } = useFeedbackContext();
  const pickFile = async () => {
    try {
      const result = await pick({
        type: fileTypes,
        allowMultiSelection: false,
      });

      const res = result[0];
      if (!res.name || !res.size || !res.type) return;
      if (res.size > 32 * 1000000) {
        setFeedback({
          text: t('common.sizeExc'),
          isError: true,
          isPersistent: false,
        });
        return;
      }
      onAttachmentChange({
        uri: res.uri,
        name: res.name,
        size: res.size,
        type: res.type,
      });
    } catch (error) {
      console.error('Cannot pick file', error);
    }
  };

  const pickPhoto = async () => {
    try {
      const picture = await openPicker({
        mediaType: 'photo',
        multiple: false,
      });
      onAttachmentChange?.({
        uri: picture.path,
        name: picture.filename || t('common.unnamedFile'),
        size: picture.size,
        type: picture.mime,
      });
    } catch (e) {
      console.error('Cannot pick photo', e);
    }
  };

  const takePhoto = async () => {
    try {
      const picture = await openCamera({
        ...pdfSizes,
        mediaType: 'photo',
        multiple: false,
        cropping: true,
        freeStyleCropEnabled: true,
        includeBase64: true,
      });
      onAttachmentChange?.({
        uri: picture.path,
        name: picture.filename || t('common.unnamedFile'),
        size: picture.size,
        type: picture.mime,
      });
    } catch (e) {
      console.error('Cannot take photo', e);
    }
  };

  const replayAccessibilityLabel = useMemo(() => {
    const baseText = t('ticketScreen.reply');
    if (!disabled) {
      return [baseText, t('messagingView.activeReplay')].join(', ');
    } else {
      return [baseText, t('common.disabledPreviousValue')].join(', ');
    }
  }, [disabled, t]);

  return (
    <View
      {...props}
      style={[styles.wrapper, translucent && styles.translucent, props.style]}
    >
      {translucent && <TranslucentView fallbackOpacity={1} />}
      <Col>
        {!!attachment && (
          <AttachmentChip
            attachment={attachment}
            onClearAttachment={() => onAttachmentChange(undefined)}
            style={styles.attachmentContainer}
          />
        )}
        <Row align="flex-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('messagingView.pickFile')}
          >
            <MenuView
              title={t('ticketScreen.pickFileTitle')}
              actions={[
                {
                  id: 'pickFile',
                  title: t('messagingView.pickFile'),
                  subtitle: t('messagingView.pickFileHint'),
                  image: 'folder',
                },
                {
                  id: 'pickPhoto',
                  title: t('messagingView.pickPhoto'),
                  subtitle: t('messagingView.pickPhotoHint'),
                  image: 'photo',
                },
                {
                  id: 'takePhoto',
                  title: t('messagingView.takePhoto'),
                  subtitle: t('messagingView.takePhotoHint'),
                  image: 'camera',
                },
              ]}
              onPressAction={event => {
                switch (event.nativeEvent.event) {
                  case 'pickFile':
                    pickFile();
                    break;
                  case 'pickPhoto':
                    pickPhoto();
                    break;
                  case 'takePhoto':
                    takePhoto();
                    break;
                  default:
                    break;
                }
              }}
            >
              <IconButton
                accessibilityRole="button"
                accessibilityLabel={t('messagingView.pickFile')}
                icon={faPaperclip}
                size={22}
                style={styles.actionButton}
                disabled={disabled}
              />
            </MenuView>
          </Pressable>
          <TranslucentTextField
            label={t('ticketScreen.reply')}
            accessibilityLabel={replayAccessibilityLabel}
            value={message}
            autoCapitalize="sentences"
            onChangeText={onMessageChange}
            multiline
            editable={!disabled}
            containerStyle={{ flex: 1 }}
            style={[{ maxHeight: 220 }, { flexGrow: 1 }, textFieldStyle]}
            numberOfLines={numberOfLines}
          />
          {showSendButton && (
            <IconButton
              accessibilityRole="button"
              accessibilityLabel={t('ticketScreen.send')}
              disabled={!message?.length || loading}
              onPress={onSend}
              icon={faPaperPlane}
              size={22}
              loading={loading}
              style={styles.actionButton}
            />
          )}
        </Row>
      </Col>
    </View>
  );
};

const createStyles = ({ spacing, colors, safeAreaInsets }: Theme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: spacing[2],
      paddingLeft: Math.max(safeAreaInsets.left, spacing[2]),
      paddingRight: Math.max(safeAreaInsets.right, spacing[2]),
    },
    translucent: {
      borderColor: colors.divider,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    attachmentContainer: {
      marginLeft: spacing[10],
      marginRight: spacing[2],
      marginBottom: spacing[2],
    },
    actionButton: {
      opacity: Platform.select({ ios: 0.8 }),
      padding: spacing[2.5],
    },
  });
