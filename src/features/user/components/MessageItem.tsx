import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Message } from '@polito/api-client';

import { useGetPerson } from '../../../core/queries/peopleHooks';
import { getHtmlTextContent } from '../../../utils/html';

export type Props = {
  message: Message;
  modal: boolean;
};

export const MessageItem = ({ message, modal }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const hasSender = !!message?.senderId;
  const title = message?.title;
  const text = message?.message;
  const personQuery = useGetPerson(message?.senderId || undefined);

  return (
    <SafeAreaView>
      <Section>
        <Text variant="title" role="heading" style={styles.heading}>
          {title ?? ''}
        </Text>
        {!!text && (
          <View style={styles.textMessage}>
            <Text weight="normal">{getHtmlTextContent(text)}</Text>
          </View>
        )}
      </Section>
      {!!personQuery.data && hasSender && (
        <>
          <View style={styles.container}>
            <Text variant="subHeading" weight="semibold">
              {t('messageScreen.sender')}
            </Text>
          </View>
          <PersonListItem
            person={personQuery.data}
            subtitle={t('common.teacher')}
            navigateEnabled={!modal}
          />
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
