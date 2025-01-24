import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { ScreenContainer } from '@lib/ui/components/ScreenContainer';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Select } from '@lib/ui/components/Select';
import { TextField } from '@lib/ui/components/TextField';
import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { CreateTicketRequest } from '@polito/api-client';
import { MenuAction } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  useCreateTicket,
  useGetTicketTopics,
} from '../../../core/queries/ticketHooks';
import { darkTheme } from '../../../core/themes/dark';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { Attachment } from '../../services/types/Attachment';
import { MessagingView } from '../components/MessagingView';

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
      navigation.navigate(initialTopicId ? 'Services' : 'Tickets');
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

  const topicOptions = useMemo(() => {
    return topics.map(topic => ({
      id: topic.id.toString(),
      title: topic.name,
      state: (topic.id.toString() === topicId
        ? 'on'
        : 'off') as MenuAction['state'],
    }));
  }, [topicId, topics]);

  const subtopicOptions = useMemo(
    () =>
      subTopics.map(subtopic => {
        const subId = subtopic.id.toString();
        return {
          id: subId,
          title: subtopic.name,
          state: (subId === ticketBody.subtopicId?.toString()
            ? 'on'
            : 'off') as MenuAction['state'],
        };
      }),
    [subTopics, ticketBody.subtopicId],
  );

  const subjectAccessibilityLabel = useMemo(() => {
    const baseText = t('createTicketScreen.subjectLabel');
    if (ticketBody?.subtopicId) {
      return baseText;
    } else {
      return [baseText, t('common.disabledPreviousValue')].join(', ');
    }
  }, [t, ticketBody?.subtopicId]);

  const subtopicAccessibilityLabel = useMemo(() => {
    const baseText = t('createTicketScreen.subtopicDropdownLabelAccessibility');
    if (topicId) {
      return baseText;
    } else {
      return [baseText, t('common.disabledPreviousValue')].join(', ');
    }
  }, [t, topicId]);

  return (
    <ScreenContainer>
      <Section>
        <SectionHeader title={t('createTicketScreen.subtitle')} />
        <OverviewList>
          <Select
            accessibilityLabel={t(
              'createTicketScreen.topicDropdownLabelAccessibility',
            )}
            label={t('createTicketScreen.topicDropdownLabel')}
            description={t('createTicketScreen.topicDescription')}
            options={topicOptions}
            onSelectOption={updateTopicId}
            disabled={!!initialTopicId}
            value={topicId}
          />
        </OverviewList>

        <OverviewList>
          <Select
            accessibilityLabel={subtopicAccessibilityLabel}
            options={subtopicOptions}
            onSelectOption={updateTicketBodyField('subtopicId')}
            disabled={!topicId || !!initialTopicId}
            value={ticketBody?.subtopicId?.toString()}
            label={t('createTicketScreen.subtopicDropdownLabel')}
            description={t('createTicketScreen.subtopicDescription')}
          />
        </OverviewList>

        <OverviewList style={styles.objectSection}>
          <TextField
            accessibilityLabel={subjectAccessibilityLabel}
            autoCapitalize="sentences"
            label={t('createTicketScreen.subjectLabel')}
            inputStyle={styles.textFieldInput}
            editable={!!ticketBody?.subtopicId}
            value={ticketBody.subject}
            onChangeText={updateTicketBodyField('subject')}
          />
        </OverviewList>

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
              style={styles.bubbleInput}
              textFieldStyle={styles.textField}
            />
          </ThemeContext.Provider>
        </ChatBubble>
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
        loading={isLoading}
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
