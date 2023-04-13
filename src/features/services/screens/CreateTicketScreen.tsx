import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Select } from '@lib/ui/components/Select';
import { TextField } from '@lib/ui/components/TextField';
import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CreateTicketRequest } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  useCreateTicket,
  useGetTicketTopics,
} from '../../../core/queries/ticketHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { darkTheme } from '../../../core/themes/dark';
import { MessagingView } from '../components/MessagingView';
import { ServiceStackParamList } from '../components/ServicesNavigator';
import { Attachment } from '../types/Attachment';

type Props = NativeStackScreenProps<ServiceStackParamList, 'CreateTicket'>;

export const CreateTicketScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { topicId: initialTopicId, subtopicId: initialSubtopicId } =
    route.params;
  const ticketTopicQuery = useGetTicketTopics();
  const topics = useMemo(() => {
    if (!ticketTopicQuery.data) return [];
    return ticketTopicQuery.data;
  }, [ticketTopicQuery.data]);
  const styles = useStylesheet(createStyles);

  const [topicId, setTopicId] = useState(initialTopicId?.toString());
  const [ticketBody, setTicketBody] = useState<Partial<CreateTicketRequest>>({
    subject: undefined,
    message: undefined,
    subtopicId: initialSubtopicId,
    attachment: undefined,
  });
  const {
    mutateAsync: handleCreateTicket,
    isLoading,
    isSuccess,
    data,
  } = useCreateTicket();

  const createTopicEnabled = useMemo(() => {
    const { subject, message, subtopicId } = ticketBody;
    return !!subject && !!message && !!subtopicId;
  }, [ticketBody]);

  useEffect(() => {
    if (isSuccess && !!data.id) {
      navigation.navigate(initialTopicId ? 'Home' : 'Tickets');
      navigation.navigate('Ticket', { id: data.id });
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
    setTicketBody(prevState => ({
      ...prevState,
      subtopicId: undefined,
      attachment: undefined,
    }));
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
    >
      <Section>
        <SectionHeader title={t('createTicketScreen.subtitle')} />

        <SectionList>
          <Select
            label={t('createTicketScreen.topic')}
            description={t('createTicketScreen.topicDescription')}
            options={topics.map(topic => ({
              id: topic.id.toString(),
              title: topic.name,
            }))}
            onSelectOption={updateTopicId}
            disabled={!!initialTopicId}
            value={topicId}
          />
        </SectionList>

        <SectionList>
          <Select
            options={subTopics.map(subTopic => {
              return {
                id: subTopic.id.toString(),
                title: subTopic.name,
              };
            })}
            onSelectOption={updateTicketBodyField('subtopicId')}
            disabled={!topicId || !!initialTopicId}
            value={ticketBody?.subtopicId?.toString()}
            label={t('createTicketScreen.subtopic')}
            description={t('createTicketScreen.subtopicDescription')}
          />
        </SectionList>

        <SectionList style={styles.objectSection}>
          <TextField
            autoCapitalize="sentences"
            label={t('createTicketScreen.subjectLabel')}
            inputStyle={styles.textFieldInput}
            editable={!!ticketBody?.subtopicId}
            value={ticketBody.subject}
            onChangeText={updateTicketBodyField('subject')}
          />
        </SectionList>

        <ChatBubble style={styles.bubbleContainer} bubbleStyle={styles.bubble}>
          <ThemeContext.Provider value={darkTheme}>
            <MessagingView
              translucent={false}
              showSendButton={false}
              message={ticketBody.message}
              onMessageChange={updateTicketBodyField('message')}
              attachment={ticketBody.attachment as unknown as Attachment}
              onAttachmentChange={updateTicketBodyField('attachment') as any}
              disabled={!ticketBody.subtopicId}
              numberOfLines={5}
              style={GlobalStyles.grow}
              textFieldStyle={styles.textField}
            />
          </ThemeContext.Provider>
        </ChatBubble>
      </Section>

      <CtaButton
        absolute={false}
        disabled={!createTopicEnabled}
        title={t('createTicketScreen.sendTicket')}
        action={() => handleCreateTicket(ticketBody as CreateTicketRequest)}
        loading={isLoading}
        icon={faPaperPlane}
      />
    </ScrollView>
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
    container: {
      paddingVertical: spacing[5],
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
