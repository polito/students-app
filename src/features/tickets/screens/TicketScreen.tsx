import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { IconButton } from '@lib/ui/components/IconButton';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { IS_IOS } from '../../../core/constants';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetTicket,
  useMarkTicketAsClosed,
  useMarkTicketAsRead,
} from '../../../core/queries/ticketHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { ChatMessage } from '../components/ChatMessage';
import { HtmlMessage } from '../components/HtmlMessage';
import { TicketAttachmentChip } from '../components/TicketAttachmentChip';
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
    if (ticket.status !== TicketStatus.Closed) {
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
  }, [t, ticket.status]);

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
  }, [isSuccess, navigation]);

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
  const { mutate: markAsRead } = useMarkTicketAsRead(id);
  const { spacing } = useTheme();
  const headerHeight = useHeaderHeight();
  const bottomBarHeight = useBottomTabBarHeight();
  const [textFieldHeight, setTextFieldHeight] = useState(50);
  const ticket = ticketQuery.data;
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { clearNotificationScope } = useNotifications();
  const { t } = useTranslation();
  const [styless, setStyless] = useState(styles);
  const { accessibility } = usePreferencesContext();
  const { fontSizes } = useTheme();
  const accessibilityMessageText = [
    t('ticketScreen.yourQuestion'),
    ticket?.message,
  ].join(', ');

  useScreenTitle(ticket?.subject);

  useEffect(() => {
    if (!ticket) {
      return;
    }
    clearNotificationScope([
      'services',
      'tickets',
      ticket.id.toString(),
    ] as unknown as Parameters<typeof clearNotificationScope>['0']); // TODO check PathExtractor type
    if (ticket.unreadCount === 0) {
      return;
    }
    markAsRead();
  }, [markAsRead, clearNotificationScope, ticket]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        ticket?.status &&
        ticket?.status !== TicketStatus.Closed && (
          <HeaderRight ticket={ticket} />
        ),
    });
  }, [navigation, ticket]);

  const replies = useMemo(
    () =>
      ticket?.replies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ) ?? [],
    [ticket],
  );

  useEffect(() => {
    const changeStyle = () => {
      setStyless(prevStyles => ({
        ...prevStyles,
        text: {
          ...prevStyles.text,
          lineHeight:
            accessibility?.fontPlacement === 'long-text' &&
            accessibility?.lineHeight
              ? fontSizes.sm * 1.5
              : undefined,
          letterSpacing:
            accessibility?.fontPlacement === 'long-text'
              ? fontSizes.sm * 0.12
              : undefined,
          marginBottom:
            accessibility?.fontPlacement === 'long-text' &&
            accessibility?.paragraphSpacing
              ? fontSizes.sm * 2
              : 0,
        },
      }));
    };
    changeStyle();
  }, [accessibility, fontSizes]);

  return (
    <View style={GlobalStyles.grow}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        inverted
        contentContainerStyle={[
          {
            paddingTop: textFieldHeight + bottomBarHeight + spacing[5],
            paddingBottom: IS_IOS ? headerHeight + spacing[5] : undefined,
          },
          paddingHorizontal,
        ]}
        refreshControl={<RefreshControl queries={[ticketQuery]} />}
        data={replies}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={
          !ticketQuery?.isLoading && !!ticket ? (
            <>
              <TicketStatusInfo
                ticket={ticket}
                loading={ticketQuery?.isLoading}
              />
              <Pressable
                accessibilityRole="text"
                accessibilityLabel={accessibilityMessageText}
              >
                <ChatBubble
                  accessibilityRole="text"
                  accessibilityLabel={accessibilityMessageText}
                  style={styless.requestMessage}
                >
                  <HtmlMessage
                    message={ticket?.message}
                    baseStyle={styless.text}
                  />
                  {ticket.hasAttachments && (
                    <View>
                      {ticket.attachments.map((item, index) => (
                        <TicketAttachmentChip
                          key={index}
                          attachment={item}
                          ticketId={ticket.id}
                        />
                      ))}
                    </View>
                  )}
                </ChatBubble>
              </Pressable>
            </>
          ) : undefined
        }
        renderItem={({ item: reply }) => (
          <ChatMessage
            message={reply}
            ticketId={ticket!.id}
            received={!!reply?.isFromAgent}
          />
        )}
        ItemSeparatorComponent={() => <View style={styless.separator} />}
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

const createStyles = ({ spacing, fontSizes, colors }: Theme) =>
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
    text: {
      padding: 0,
      fontSize: fontSizes.sm,
      color: colors.white,
      textDecorationColor: colors.white,
    },
  });
