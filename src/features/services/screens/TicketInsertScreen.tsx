import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { openCamera } from 'react-native-image-crop-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
  faCamera,
  faPaperclip,
  faShare,
} from '@fortawesome/free-solid-svg-icons';
import { ActionSheet } from '@lib/ui/components/ActionSheet';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { DropdownField } from '@lib/ui/components/DropdownField';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CreateTicketRequest } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SCREEN_WIDTH } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import {
  useCreateTicket,
  useGetTicketTopics,
} from '../../../core/queries/ticketHooks';
import { pdfSizes } from '../../teaching/constants';
import { AttachmentBlobCard } from '../components/AttachmentBlobCard';
import { ServiceStackParamList } from '../components/ServiceNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketInsert'>;

export const TicketInsertScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { topicId: initialTopicId, subtopicId: initialSubtopicId } =
    route.params;
  console.debug(initialTopicId, initialSubtopicId);
  const theme = useTheme();
  const { colors } = theme;
  const actionSheetRef = useRef(null);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const scroll = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const ticketTopicQuery = useGetTicketTopics();
  const topics = ticketTopicQuery?.data?.data ?? [];
  const styles = createStyles(theme);
  const [topicId, setTopicId] = useState(
    initialTopicId?.toString() || undefined,
  );
  const [ticketBody, setTicketBody] = useState<CreateTicketRequest>({
    subject: undefined,
    message: undefined,
    subtopicId: initialSubtopicId,
    attachment: null,
  });

  const {
    mutateAsync: handleCreateTicket,
    isLoading,
    isSuccess,
    data,
  } = useCreateTicket();

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => hideSubscription.remove();
  }, []);

  useEffect(() => {
    if (isSuccess && !!data?.data?.id) {
      navigation.navigate('Ticket', { id: data?.data?.id });
    }
  }, [isSuccess, data]);

  const subTopics = useMemo(
    () =>
      topics?.find(topic => topic.id.toString() === topicId)?.subtopics ?? [],
    [topicId, topics],
  );

  const updateTicketBodyField =
    (field: keyof CreateTicketRequest) => (value: string | number | Blob) => {
      setTicketBody(prevState => ({
        ...prevState,
        [field]: value,
      }));
    };

  const updateTopicId = (value: string) => {
    setTopicId(value);
    setTicketBody(() => ({
      subject: undefined,
      message: undefined,
      subtopicId: undefined,
      attachment: null,
    }));
  };

  const onPressUploadFile = async () => {
    try {
      const asset = await DocumentPicker.pickSingle({});
      const blob = await fetch(asset.uri).then(r => r.blob());
      updateTicketBodyField('attachment')(blob);
    } catch (e) {
      console.debug({ errorUploadFile: e });
    }
  };

  const onPressTakePhoto = async () => {
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
      updateTicketBodyField('attachment')(blob);
    } catch (e) {
      console.debug({ errorOnPressTakePhoto: e });
    }
  };

  return (
    <>
      <ActionSheet
        ref={actionSheetRef}
        options={[
          {
            title: t('common.uploadFile'),
            titleAndroid: t('common.upload'),
            subtitle: t('common.uploadFileSubtitle'),
            icon: faPaperclip,
            iconStyle: {},
            onPress: onPressUploadFile,
          },
          {
            title: t('common.takePhoto'),
            titleAndroid: t('common.camera'),
            subtitle: t('common.takePhotoSubtitle'),
            icon: faCamera,
            iconStyle: {},
            onPress: onPressTakePhoto,
          },
        ]}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
        ref={scroll}
        innerRef={ref => {
          scroll.current = ref;
        }}
      >
        <View style={styles.sectionsContainer}>
          <Section>
            <SectionHeader title={t('ticketInsertScreen.subtitle')} />
            <View style={[styles.section]}>
              <DropdownField
                options={topics.map(topic => {
                  return {
                    id: topic.id.toString(),
                    title: topic.name,
                  };
                })}
                onSelectOption={updateTopicId}
                disabled={!!initialTopicId}
                value={topicId}
                placeholder={t('ticketInsertScreen.topicDropdownPlaceholder')}
                label={t('ticketInsertScreen.topicDropdownLabel')}
              />
            </View>
            <View style={styles.section}>
              <DropdownField
                options={subTopics.map(subTopic => {
                  return {
                    id: subTopic.id.toString(),
                    title: subTopic.name,
                  };
                })}
                onSelectOption={updateTicketBodyField('subtopicId')}
                disabled={!topicId || !!initialTopicId}
                value={ticketBody?.subtopicId?.toString()}
                placeholder={t(
                  'ticketInsertScreen.subtopicDropdownPlaceholder',
                )}
                label={t('ticketInsertScreen.subtopicDropdownLabel')}
              />
            </View>
            <View style={styles.section}>
              <View style={styles.textFieldWrapper}>
                <Text style={styles.textFieldLabel}>
                  {t('ticketInsertScreen.subject')}
                </Text>
                <TextField
                  label={t('ticketInsertScreen.subjectLabel')}
                  value={ticketBody.subject}
                  onChangeText={updateTicketBodyField('subject')}
                  editable={!!ticketBody?.subtopicId}
                  returnKeyType="next"
                  onPressIn={() =>
                    !!ticketBody.subtopicId && setKeyboardVisible(true)
                  }
                  style={[
                    styles.textField,
                    !ticketBody?.subtopicId && styles.textFieldDisabled,
                  ]}
                  inputStyle={styles.textFieldInput}
                />
              </View>
            </View>
            <View style={[styles.section, styles.sectionMessage]}>
              {!!ticketBody.attachment && (
                <Row
                  justifyCenter
                  alignCenter
                  style={styles.attachmentContainer}
                >
                  <FlatList
                    data={[ticketBody?.attachment]}
                    contentContainerStyle={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                      return (
                        <AttachmentBlobCard
                          attachment={item}
                          onPressCancelAttachment={() =>
                            updateTicketBodyField('attachment')(null)
                          }
                        />
                      );
                    }}
                  />
                </Row>
              )}
              <Row
                alignCenter
                noFlex
                justifyCenter
                style={styles.sectionMessageContainer}
              >
                <Col noFlex justifyStart style={{ height: '100%' }}>
                  <IconButton
                    disabled={!ticketBody.subtopicId}
                    onPress={() => actionSheetRef.current.show()}
                    icon={faPaperclip}
                    size={24}
                    color={colors.text['100']}
                  />
                </Col>
                <Col>
                  <TextField
                    label={t('ticketInsertScreen.messageLabel')}
                    value={ticketBody.message}
                    onChangeText={updateTicketBodyField('message')}
                    multiline
                    numberOfLines={5}
                    returnKeyType="done"
                    onKeyPress={({ nativeEvent }) => {
                      nativeEvent.key === 'Enter' && Keyboard.dismiss();
                    }}
                    onPressIn={() =>
                      !!ticketBody.subject && setKeyboardVisible(true)
                    }
                    editable={!!ticketBody.subject}
                    style={[styles.textFieldSendMessage]}
                    inputStyle={[
                      styles.textFieldInput,
                      !ticketBody.subject && { opacity: 0.5 },
                    ]}
                  />
                </Col>
                <View style={styles.rightArrow} />
                <View style={styles.rightArrowOverlap} />
              </Row>
            </View>
          </Section>
        </View>
      </KeyboardAwareScrollView>
      <CtaButton
        absolute={true}
        disabled={!ticketBody.message}
        title={t('ticketInsertScreen.sendTicket')}
        action={() => handleCreateTicket(ticketBody)}
        loading={isLoading}
        icon={faShare}
      />
    </>
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
    sectionsContainer: {
      paddingVertical: spacing[5],
    },
    attachmentContainer: {
      marginBottom: spacing[4],
    },
    sectionMessageContainer: {
      backgroundColor: colors.primary[500],
      borderRadius: shapes.lg * 1.5,
      padding: spacing[2.5],
    },
    section: {
      marginVertical: spacing[2],
      marginHorizontal: spacing[4],
    },
    sectionMessage: {
      marginTop: spacing[6],
    },
    rightArrow: {
      position: 'absolute',
      backgroundColor: colors.primary[500],
      width: 20,
      height: 25,
      bottom: 0,
      borderBottomLeftRadius: 22,
      right: -spacing[2.5],
    },
    rightArrowOverlap: {
      position: 'absolute',
      backgroundColor: colors.background,
      // backgroundColor: 'red',
      width: spacing[4],
      height: 35,
      bottom: 0,
      borderBottomLeftRadius: 25,
      right: -spacing[4],
    },
    search: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    mainSections: {
      backgroundColor: 'red',
    },
    textFieldLabel: {
      color: colors.text['500'],
      marginHorizontal: spacing['2'],
      marginVertical: spacing['1'],
    },
    textFieldDisabled: {
      opacity: 0.5,
    },
    bottomFieldTextWrapper: {
      display: 'flex',
      flexDirection: 'row',
      width: SCREEN_WIDTH * 0.8,
    },
    textField: {
      borderRadius: shapes.sm,
      borderWidth: 1,
      backgroundColor: colors.surface,
      paddingVertical: 0,
      borderColor: colors.divider,
      width: '100%',
    },
    textFieldSendMessage: {
      borderRadius: shapes.lg,
      borderWidth: 1,
      backgroundColor: colors.surface,
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderColor: colors.divider,
      width: '100%',
      minHeight: 100,
      textAlignVertical: 'top',
    },
    textFieldInput: {
      fontSize: fontSizes.sm,
      textAlignVertical: 'top',
      borderBottomWidth: 0,
      fontWeight: fontWeights.normal,
    },
    textFieldWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  });
