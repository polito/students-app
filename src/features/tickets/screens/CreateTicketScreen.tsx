import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { ScreenContainer } from '@lib/ui/components/ScreenContainer';
import { Section } from '@lib/ui/components/Section';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CreateTicketRequest } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useCreateTicket } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { Attachment } from '../../services/types/Attachment';
import { MessagingView } from '../components/MessagingView';

type Props = NativeStackScreenProps<ServiceStackParamList, 'CreateTicket'>;

export const CreateTicketScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { topicId: initialTopicId, subtopicId: initialSubtopicId } =
    route.params ?? {};
  const styles = useStylesheet(createStyles);

  const [, setTopicId] = useState(initialTopicId?.toString());
  const [ticketBody, setTicketBody] = useState<Partial<CreateTicketRequest>>({
    subject: undefined,
    message: undefined,
    subtopicId: initialSubtopicId,
    attachment: undefined,
  });

  useEffect(() => {
    if (route.params?.selectedTopic && route.params?.selectedSubtopic) {
      const numericTopicId =
        typeof route.params.selectedTopic.id === 'string'
          ? parseInt(route.params.selectedTopic.id, 10)
          : route.params.selectedTopic.id;
      const numericSubtopicId =
        typeof route.params.selectedSubtopic.id === 'string'
          ? parseInt(route.params.selectedSubtopic.id, 10)
          : route.params.selectedSubtopic.id;

      setTopicId(numericTopicId.toString());
      setTicketBody(prev => ({
        ...prev,
        subtopicId: numericSubtopicId,
      }));
    }
  }, [route.params?.selectedTopic, route.params?.selectedSubtopic]);
  const {
    mutateAsync: handleCreateTicket,
    isPending,
    isSuccess,
    data,
  } = useCreateTicket();

  const createTopicEnabled = useMemo(() => {
    const { subject, message, subtopicId } = ticketBody;
    return !!subject && !!message && !!subtopicId;
  }, [ticketBody]);

  useEffect(() => {
    if (isSuccess && !!data.id) {
      navigation.navigate(initialTopicId ? 'Services' : 'Tickets');
      navigation.navigate('Ticket', { id: data.id });
    }
  }, [isSuccess, data, initialTopicId, navigation]);

  const updateTicketBodyField =
    (field: keyof CreateTicketRequest) => (value: string | number | Blob) => {
      setTicketBody(prevState => ({
        ...prevState,
        [field]: value,
      }));
    };

  const subjectAccessibilityLabel = useMemo(() => {
    const baseText = t('createTicketScreen.subjectLabel');
    if (ticketBody?.subtopicId) {
      return baseText;
    } else {
      return [baseText, t('common.disabledPreviousValue')].join(', ');
    }
  }, [t, ticketBody?.subtopicId]);

  return (
    <>
      <ScreenContainer>
        <Section>
          <OverviewList rounded>
            <ListItem
              title={
                route.params?.selectedTopic?.title ??
                t('createTicketScreen.topicDropdownLabel')
              }
              subtitle={route.params?.selectedSubtopic?.title}
              trailingItem={<DisclosureIndicator />}
              linkTo={{
                screen: 'TopicScreen',
                params: {
                  onSelect: ({ topic, subtopic }: any) => {
                    navigation.setParams({
                      selectedTopic: topic,
                      selectedSubtopic: subtopic,
                    });
                  },
                  topics: undefined,
                  returnScreen: 'CreateTicket',
                },
              }}
              accessibilityLabel={t(
                'createTicketScreen.topicDropdownLabelAccessibility',
              )}
            />
          </OverviewList>

          <OverviewList rounded>
            <ListItem
              title={t('createTicketScreen.subjectTitle')}
              containerStyle={styles.subjectTitleContainer}
            />
            <TextField
              accessibilityLabel={subjectAccessibilityLabel}
              autoCapitalize="sentences"
              label={t('createTicketScreen.subjectLabel')}
              style={styles.subjectTextField}
              inputStyle={styles.textFieldInput}
              editable={true}
              value={ticketBody.subject}
              onChangeText={updateTicketBodyField('subject')}
            />
          </OverviewList>

          <OverviewList rounded>
            <ListItem
              title={t('createTicketScreen.messageTitle')}
              containerStyle={styles.messageTitleContainer}
            />
            <MessagingView
              translucent={false}
              showSendButton={false}
              message={ticketBody.message}
              onMessageChange={updateTicketBodyField('message')}
              attachment={ticketBody.attachment as unknown as Attachment}
              onAttachmentChange={attachment =>
                updateTicketBodyField('attachment')(attachment as any)
              }
              disabled={!ticketBody.subtopicId}
              numberOfLines={15}
              style={[
                styles.bubbleInput,
                styles.messageContainer,
                styles.messageField,
              ]}
              textFieldStyle={[styles.textField, styles.messageInput]}
            />
          </OverviewList>
        </Section>
      </ScreenContainer>

      <CtaButton
        absolute={true}
        disabled={!createTopicEnabled}
        title={t('createTicketScreen.sendTicket')}
        action={() =>
          handleCreateTicket({
            ...ticketBody,
            message: ticketBody?.message?.trim().replace(/\n/g, '<br>'),
          } as CreateTicketRequest)
        }
        loading={isPending}
        icon={faPaperPlane}
        containerStyle={{ left: 0, right: 0 }}
      />
    </>
  );
};

const createStyles = ({ shapes, spacing }: Theme) =>
  StyleSheet.create({
    bubble: {
      marginTop: spacing[2],
      padding: 0,
      width: '100%',
    },
    bubbleContainer: {
      marginHorizontal: spacing[5],
    },
    bubbleInput: {
      paddingRight: 0,
    },
    messageContainer: {},
    messageField: {
      paddingTop: 0,
      paddingBottom: spacing[2],
      marginTop: -spacing[1],
    },
    messageInput: {
      minHeight: 120,
    },
    messageTitleContainer: {
      paddingBottom: 0,
      marginBottom: -spacing[1],
    },
    objectSection: {
      height: 60,
      justifyContent: 'center',
    },
    subjectTextField: {
      paddingTop: 0,
      paddingBottom: spacing[2],
      marginTop: -spacing[2],
    },
    subjectTitleContainer: {
      paddingBottom: 0,
      marginBottom: -spacing[1],
    },
    textField: {
      borderRadius: shapes.md,
      marginRight: 0,
    },
    textFieldInput: {
      borderBottomWidth: 0,
    },
  });
