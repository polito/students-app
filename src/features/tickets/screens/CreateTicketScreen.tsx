import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
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

// import { loadLanguages } from 'i18next';

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

  // Listen for navigation param changes (from TopicScreen)
  useEffect(() => {
    if (route.params?.selectedTopic && route.params?.selectedSubtopic) {
      // Extract numeric IDs from the string IDs
      const numericTopicId = parseInt(
        route.params.selectedTopic.id.replace('t', ''),
        10,
      );
      const numericSubtopicId = parseInt(
        route.params.selectedSubtopic.id.replace('s', ''),
        10,
      );

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

  // const subTopics = useMemo(
  //   () =>
  //     topics?.find(topic => topic.id.toString() === topicId)?.subtopics ?? [],
  //   [topicId, topics],
  // );

  const updateTicketBodyField =
    (field: keyof CreateTicketRequest) => (value: string | number | Blob) => {
      setTicketBody(prevState => ({
        ...prevState,
        [field]: value,
      }));
    };

  // const updateTopicId = (value: string) => {
  //   setTopicId(value);
  //   setTicketBody(prevState => ({
  //     ...prevState,faPaperclip
  //     subtopicId: undefined,
  //     attachment: undefined,
  //   }));
  // };

  // const topicOptions = useMemo(() => {
  //   return topics.map(topic => ({
  //     id: topic.id.toString(),
  //     title: topic.name,
  //     state: (topic.id.toString() === topicId
  //       ? 'on'
  //       : 'off') as MenuAction['state'],
  //   }));
  // }, [topicId, topics]);

  // const subtopicOptions = useMemo(
  //   () =>
  //     subTopics.map(subtopic => {
  //       const subId = subtopic.id.toString();
  //       return {
  //         id: subId,
  //         title: subtopic.name,
  //         state: (subId === ticketBody.subtopicId?.toString()
  //           ? 'on'
  //           : 'off') as MenuAction['state'],
  //       };
  //     }),
  //   [subTopics, ticketBody.subtopicId],
  // );

  const subjectAccessibilityLabel = useMemo(() => {
    const baseText = t('createTicketScreen.subjectLabel');
    if (ticketBody?.subtopicId) {
      return baseText;
    } else {
      return [baseText, t('common.disabledPreviousValue')].join(', ');
    }
  }, [t, ticketBody?.subtopicId]);

  // const subtopicAccessibilityLabel = useMemo(() => {
  //   const baseText = t('createTicketScreen.subtopicDropdownLabelAccessibility');
  //   if (topicId) {
  //     return baseText;
  //   } else {
  //     return [baseText, t('common.disabledPreviousValue')].join(', ');
  //   }
  // }, [t, topicId]);

  return (
    <ScreenContainer>
      <Section>
        <OverviewList rounded>
          <ListItem
            title={
              route.params?.selectedTopic?.title ??
              t('createTicketScreen.topicDropdownLabel')
            }
            subtitle={route.params?.selectedSubtopic?.title}
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

        {/* <OverviewList rounded> 
          Topic selector dropdown
          <Select
            options={topicOptions}
            value={topicId}
            onSelectOption={updateTopicId}
            label={t('createTicketScreen.topicDropdownLabel')}
            accessibilityLabel={t('createTicketScreen.topicDropdownLabelAccessibility')}
          />
        </OverviewList> */}

        {/* Subject input card */}
        <OverviewList rounded>
          <ListItem title={t('createTicketScreen.subjectTitle')} />
          <TextField
            accessibilityLabel={subjectAccessibilityLabel}
            autoCapitalize="sentences"
            label={t('createTicketScreen.subjectLabel')}
            inputStyle={styles.textFieldInput}
            editable={true} // {!!ticketBody?.subtopicId}
            value={ticketBody.subject}
            onChangeText={updateTicketBodyField('subject')}
          />
        </OverviewList>

        <OverviewList rounded>
          <ListItem title={t('createTicketScreen.messageTitle')} />
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
            style={[styles.bubbleInput, styles.messageContainer]}
            textFieldStyle={[styles.textField, styles.messageInput]}
          />
        </OverviewList>
      </Section>

      <CtaButton
        absolute={false}
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
      />
    </ScreenContainer>
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

    messageInput: {
      minHeight: 120,
    },
    objectSection: {
      height: 60,
      justifyContent: 'center',
    },
    textField: {
      borderRadius: shapes.md,
      marginRight: 0,
    },
    textFieldInput: {
      borderBottomWidth: 0,
    },
  });
