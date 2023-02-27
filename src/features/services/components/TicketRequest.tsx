import { FlatList, StyleSheet, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Ticket } from '@polito/api-client/models/Ticket';

import { AttachmentCard } from './AttachmentCard';
import { TextMessage } from './TextMessage';
import { TimeWidget } from './TimeWidget';

export interface TicketRequestProps {
  ticket: Ticket;
}

export const TicketRequest = ({ ticket }: TicketRequestProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  console.debug({ ticket });

  return (
    <View style={styles.containerMessage}>
      <TimeWidget time={ticket?.createdAt} right />
      <View style={styles.rightMessage}>
        <FlatList
          data={ticket?.attachments ?? []}
          contentContainerStyle={styles.attachmentContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <AttachmentCard attachment={item} ticketId={ticket?.id} />
          )}
        />
        <TextMessage message={ticket?.message} />
        <View style={styles.rightArrow} />
        <View style={styles.rightArrowOverlap} />
      </View>
    </View>
  );
};

const createStyles = ({ spacing, shapes, fontSizes, colors }: Theme) =>
  StyleSheet.create({
    containerMessage: {
      marginTop: spacing['1.5'],
    },
    attachmentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageText: {
      fontSize: fontSizes.sm,
      color: 'white',
      justifyContent: 'center',
    },
    rightArrow: {
      position: 'absolute',
      backgroundColor: colors.primary[400],
      width: spacing[5],
      height: +spacing[6],
      bottom: 0,
      borderBottomLeftRadius: +spacing[6],
      right: -spacing['2.5'],
    },
    rightArrowOverlap: {
      position: 'absolute',
      backgroundColor: colors.background,
      width: spacing[5],
      height: 35,
      bottom: -spacing[2],
      borderBottomLeftRadius: +spacing[5],
      right: -spacing[5],
    },
    rightMessage: {
      backgroundColor: colors.primary[400],
      padding: spacing['2.5'],
      borderRadius: shapes.lg,
      marginRight: spacing[5],
      width: '70%',
      marginTop: spacing['1'],
      alignSelf: 'flex-end',
    },
  });
