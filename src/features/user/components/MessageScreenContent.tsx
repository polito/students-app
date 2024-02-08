import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Message } from '@polito/api-client';

import { HtmlView } from '../../../core/components/HtmlView';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { formatDateTime } from '../../../utils/dates';
import { linkUrls } from '../../../utils/html';

export type Props = {
  message: Message;
  modal?: boolean;
};

export const MessageScreenContent = ({ message, modal }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const hasSender = !!message?.senderId;
  const hasDate = !isNaN(message?.sentAt.getDate());
  const title = message?.title;
  const text = message?.message;
  const date = formatDateTime(message?.sentAt);
  const personQuery = useGetPerson(message?.senderId || undefined);

  // replace every url in string with a link
  const html = useMemo(() => {
    if (!text) return '';
    return linkUrls(text);
  }, [text]);

  return (
    <SafeAreaView>
      <Section>
        <Text variant="title" role="heading" style={styles.heading}>
          {title ?? ''}
        </Text>
        {!!hasDate && (
          <Text variant="secondaryText" role="contentinfo" style={styles.date}>
            {date}
          </Text>
        )}
        {!!text && (
          <View style={styles.textMessage}>
            <HtmlView source={{ html }} baseStyle={{ padding: 0 }} />
          </View>
        )}
      </Section>
      {hasSender && (
        <>
          <View style={styles.container}>
            <Text variant="subHeading" weight="semibold">
              {t('messageScreen.sender')}
            </Text>
          </View>
          <OverviewList indented loading={personQuery.isLoading}>
            <PersonListItem
              person={personQuery.data!}
              subtitle={t('common.teacher')}
              navigateEnabled={!modal}
            />
          </OverviewList>
        </>
      )}
    </SafeAreaView>
  );
};

const createStyles = ({ spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
      fontWeight: fontWeights.bold,
    },
    date: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[1],
    },
    textMessage: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
    },
    container: {
      paddingHorizontal: spacing[5],
    },
    infoRow: {
      marginVertical: spacing[1],
      paddingVertical: spacing[2],
    },
    iconCalendar: {
      marginRight: spacing[2],
    },
    link: {
      textDecorationLine: 'underline',
      maxWidth: '90%',
    },
  });
