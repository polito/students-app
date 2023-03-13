import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { IconButton } from '@lib/ui/components/IconButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { IS_IOS } from '../../../core/constants';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetTicket,
  useMarkTicketAsClosed,
  useMarkTicketAsRead,
} from '../../../core/queries/ticketHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { AttachmentCard } from '../components/AttachmentCard';
import { ChatMessage } from '../components/ChatMessage';
import { ServiceStackParamList } from '../components/ServicesNavigator';
import { TextMessage } from '../components/TextMessage';
import { TicketMessagingView } from '../components/TicketMessagingView';
import { TicketStatusInfo } from '../components/TicketStatusInfo';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Ticket'>;

const HeaderRight = ({ ticket }: { ticket: TicketOverview }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ServiceStackParamList, 'Ticket'>>();
  const { colors, fontSizes } = theme;
  const styles = useStylesheet(createStyles);
  const { mutateAsync: markTicketAsClosed, isSuccess } = useMarkTicketAsClosed(
    ticket?.id,
  );
  const confirm = useConfirmationDialog({
    message: t('tickets.closeTip'),
  });

  const actions = useMemo(() => {
    if (ticket?.status !== TicketStatus.Closed) {
      return [
        {
          title: t('tickets.close'),
          color: 'red',
          image: 'trash.fill',
          imageColor: 'red',
        },
      ];
    }
    return [];
  }, [ticket]);

  const onPressCloseTicket = async () => {
    if (await confirm()) {
      return markTicketAsClosed();
    }
    return Promise.reject();
  };

  useEffect(() => {
    if (isSuccess) {
      navigation.navigate('Tickets');
    }
  }, [isSuccess]);

  if (ticket?.status !== TicketStatus.Closed) {
    return (
      <MenuView
        title={t('tickets.menuAction')}
        actions={actions}
        onPressAction={onPressCloseTicket}
      >
        <IconButton
          style={styles.icon}
          icon={faEllipsisVertical}
          color={colors.secondaryText}
          size={fontSizes.xl}
        />
      </MenuView>
    );
  }

  return <View />;
};

export const TicketScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const styles = useStylesheet(createStyles);
  const ticketQuery = useGetTicket(id);
  const refreshControl = useRefreshControl(ticketQuery);
  const { mutate: markAsRead } = useMarkTicketAsRead(id);
  const { spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const [textFieldHeight, setTextFieldHeight] = useState(50);
  const ticket = ticketQuery.data?.data;

  useScreenTitle(ticket?.subject);

  useEffect(() => {
    if (!ticket || ticket.unreadCount === 0) return;
    markAsRead();
  }, [ticket]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        ticket?.status &&
        ticket?.status !== TicketStatus.Closed && (
          <HeaderRight ticket={ticket} />
        ),
    });
  }, [ticket]);

  const replies = useMemo(
    () =>
      ticket?.replies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ) ?? [],
    [ticket],
  );

  return (
    <View style={GlobalStyles.grow}>
      <FlatList
        inverted
        contentContainerStyle={{
          paddingTop: textFieldHeight + +spacing[5],
          paddingBottom: IS_IOS ? headerHeight : undefined,
        }}
        {...refreshControl}
        data={replies}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={
          !ticketQuery?.isLoading &&
          !!ticket && (
            <>
              <TicketStatusInfo
                ticket={ticket}
                loading={ticketQuery?.isLoading}
              />
              <ChatBubble style={styles.requestMessage}>
                <TextMessage message={ticket?.message} />
                {ticket.hasAttachments && (
                  <View>
                    {ticket.attachments.map((item, index) => (
                      <AttachmentCard
                        key={index}
                        attachment={item}
                        ticketId={ticket.id}
                      />
                    ))}
                  </View>
                )}
              </ChatBubble>
            </>
          )
        }
        renderItem={({ item: reply }) => (
          <ChatMessage
            message={reply}
            ticketId={ticket.id}
            received={!!reply?.isFromAgent}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <TicketMessagingView
        ticketId={id}
        onLayout={e => {
          setTextFieldHeight(e.nativeEvent.layout.height);
        }}
      />
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    separator: {
      height: spacing[3],
    },
    requestMessage: {
      marginHorizontal: spacing[5],
      marginVertical: spacing[3],
    },
    icon: {
      marginRight: -spacing[3],
    },
  });
