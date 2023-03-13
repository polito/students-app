import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View, ViewProps } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { openCamera } from 'react-native-image-crop-picker';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

import { TranslucentView } from '../../../src/core/components/TranslucentView';
import { GlobalStyles } from '../../../src/core/styles/globalStyles';
import { AttachmentBlobCard } from '../../../src/features/services/components/AttachmentBlobCard';
import { pdfSizes } from '../../../src/features/teaching/constants';

interface Props extends ViewProps {
  message?: string;
  onMessageChange?: (message: string) => void;
  onSend?: () => void;
  attachment?: Blob;
  onAttachmentChange?: (attachment?: Blob) => void;
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

  const pickFile = async () => {
    const asset = await DocumentPicker.pickSingle({});
    const blob = await fetch(asset.uri).then(r => r.blob());
    onAttachmentChange?.(blob);
  };

  const takePicture = async () => {
    try {
      const res = await openCamera({
        ...pdfSizes,
        mediaType: 'photo',
        multiple: false,
        cropping: true,
        freeStyleCropEnabled: true,
        includeBase64: true,
      });
      const blob = await fetch(res.path).then(r => r.blob());
      onAttachmentChange?.(blob);
    } catch (e) {
      console.debug({ errorTakePhoto: e });
    }
  };

  return (
    <View
      {...props}
      style={[styles.wrapper, translucent && styles.translucent, props.style]}
    >
      {translucent && <TranslucentView fallbackOpacity={1} />}
      <Col>
        {!!attachment && (
          <FlatList
            data={[attachment]}
            contentContainerStyle={styles.attachmentContainer}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              return (
                <AttachmentBlobCard
                  attachment={item}
                  onPressCancelAttachment={() => onAttachmentChange(null)}
                />
              );
            }}
          />
        )}
        <Row alignEnd>
          <MenuView
            actions={[
              {
                id: 'pickFile',
                title: t('messagingView.pickFile'),
                subtitle: t('messagingView.pickFileHint'),
                image: 'folder',
              },
              {
                id: 'takePicture',
                title: t('messagingView.takePhoto'),
                subtitle: t('messagingView.takePhotoHint'),
                image: 'camera',
              },
            ]}
            onPressAction={event => {
              if (event.nativeEvent.event === 'pickFile') {
                pickFile();
              } else {
                takePicture();
              }
            }}
          >
            <IconButton
              icon={faPaperclip}
              size={22}
              style={styles.actionButton}
              disabled={disabled}
            />
          </MenuView>
          <TranslucentTextField
            label={t('ticketScreen.reply')}
            value={message}
            onChangeText={onMessageChange}
            multiline
            editable={!disabled}
            style={[GlobalStyles.grow, textFieldStyle]}
            numberOfLines={numberOfLines}
          />
          {showSendButton && (
            <IconButton
              disabled={!message?.length}
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

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    wrapper: {
      padding: spacing[2],
    },
    translucent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderColor: colors.divider,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    attachmentContainer: {
      paddingLeft: spacing[10],
      marginBottom: spacing[2],
    },
    actionButton: {
      opacity: Platform.select({ ios: 0.8 }),
      padding: spacing[1.5],
    },
  });
