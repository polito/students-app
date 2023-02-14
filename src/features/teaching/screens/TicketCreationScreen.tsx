import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { DropdownField } from '@lib/ui/components/DropdownField';
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
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'TicketCreation'>;

export const TicketCreationScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketTopicQuery = useGetTicketTopics();
  const [topicId, setTopicId] = useState(undefined);
  const [ticketBody, setTicketBody] = useState<CreateTicketRequest>({
    subject: undefined,
    message: undefined,
    subtopicId: undefined,
    attachment: null,
  });
  const { mutateAsync: handleCreateTicket, isLoading } = useCreateTicket();
  const topics = ticketTopicQuery?.data?.data ?? [];
  const subTopics = useMemo(() => {
    console.debug({ topicId });
    return (
      topics?.find(topic => topic.id.toString() === topicId)?.subtopics ?? []
    );
  }, [topicId, topics]);

  console.debug({ topics, subTopics });

  const updateTicketBodyField =
    (field: keyof CreateTicketRequest) =>
    (value: string | number | FormData) => {
      setTicketBody(prevState => ({
        ...prevState,
        [field]: value,
      }));
    };

  const updateTopicId = (value: string) => {
    setTopicId(value);
    updateTicketBodyField('subtopicId')(undefined);
    updateTicketBodyField('subject')(undefined);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
      >
        <Section>
          <SectionHeader title={t('ticketCreationScreen.subtitle')} />
          <View style={styles.section}>
            <DropdownField
              options={topics.map(topic => {
                return {
                  id: topic.id.toString(),
                  title: topic.name,
                };
              })}
              onSelectOption={updateTopicId}
              value={topicId}
              placeholder={t('ticketCreationScreen.topicDropdownPlaceholder')}
              label={t('ticketCreationScreen.topicDropdownLabel')}
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
              disabled={!topicId}
              value={ticketBody?.subtopicId?.toString()}
              placeholder={t(
                'ticketCreationScreen.subtopicDropdownPlaceholder',
              )}
              label={t('ticketCreationScreen.subtopicDropdownLabel')}
            />
          </View>
          <View style={styles.section}>
            <View style={styles.textFieldWrapper}>
              <Text style={styles.textFieldLabel}>
                {t('ticketCreationScreen.subject')}
              </Text>
              <TextField
                label={t('ticketCreationScreen.subjectLabel')}
                value={ticketBody.subject}
                onChangeText={updateTicketBodyField('subject')}
                editable={!!ticketBody?.subtopicId}
                returnKeyType="next"
                style={styles.textField}
                inputStyle={styles.textFieldInput}
              />
            </View>
          </View>
        </Section>
      </ScrollView>
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
    section: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    textFieldLabel: {
      color: colors.text['200'],
      marginHorizontal: spacing['2'],
      marginVertical: spacing['1'],
    },
    textField: {
      borderRadius: shapes.sm,
      borderWidth: 1,
      paddingVertical: 0,
      borderColor: colors.divider,
      width: SCREEN_WIDTH * 0.9,
    },
    textFieldInput: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
    },
    textFieldWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  });
