import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import {
  useGetTicket,
  useMarkTicketAsClosed,
  useMarkTicketAsRead,
} from '../../../core/queries/ticketHooks';
import { ChatMessage } from '../components/ChatMessage';
import { ServiceStackParamList } from '../components/ServiceNavigator';
import { TicketRequest } from '../components/TicketRequest';
import { TicketStatusInfo } from '../components/TicketStatusInfo';
import { TicketTextField } from '../components/TicketTextField';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Ticket'>;

const HeaderRight = ({ ticket }: { ticket: TicketOverview }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, fontSizes } = theme;
  const styles = createStyles(theme);
  const { mutateAsync: markTicketAsClosed } = useMarkTicketAsClosed(ticket?.id);
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
  const ticketQuery = useGetTicket(id);
  const { mutate } = useMarkTicketAsRead(id);
  const theme = useTheme();
  const styles = createStyles(theme);
  const headerHeight = useHeaderHeight();
  const bottomBarHeight = useBottomTabBarHeight();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const routes = navigation.getState()?.routes;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [ticketStatusHeight, setTicketStatusHeight] = useState(0);
  const ticket = ticketQuery?.data?.data;

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    const showSubscription = Keyboard.addListener('keyboardWillShow', () =>
      setKeyboardVisible(true),
    );
    return () => {
      hideSubscription.remove();
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    mutate();
    if (routes[routes.length - 2]?.name === 'TicketInsert') {
      navigation.setOptions({
        headerLeft: props => (
          <HeaderBackButton
            {...props}
            labelVisible={true}
            onPress={() => navigation.replace('Tickets')}
          />
        ),
      });
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight ticket={ticket} />,
    });
  }, [ticket]);

  const replies = useMemo(() => {
    return ticket?.replies.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [ticket]);

  const Header = () => {
    if (keyboardVisible) {
      return <View />;
    }
    return (
      <View
        style={[styles.header, IS_IOS && { top: headerHeight }]}
        onLayout={({ nativeEvent }) => {
          setTicketStatusHeight(
            nativeEvent.layout.height + (IS_IOS ? headerHeight : 0),
          );
        }}
      >
        <SectionHeader title={ticket?.subject} />
        <TicketStatusInfo
          ticket={ticket}
          loading={ticketQuery?.isLoading}
          refetching={ticketQuery?.isRefetching}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={replies}
        contentContainerStyle={[
          bottomBarAwareStyles,
          { paddingBottom: ticketStatusHeight },
          { paddingTop: IS_ANDROID && bottomBarHeight },
        ]}
        keyExtractor={item => item.id.toString()}
        inverted
        ListFooterComponent={
          !ticketQuery?.isLoading && <TicketRequest ticket={ticket} />
        }
        renderItem={({ item: reply }) => (
          <ChatMessage
            message={reply}
            ticketId={ticket.id}
            received={!!reply?.agentId}
          />
        )}
      />
      <KeyboardAvoidingView behavior={IS_IOS ? 'padding' : 'height'}>
        <TicketTextField ticketId={id} />
      </KeyboardAvoidingView>
      <Header />
    </View>
  );
};

const createStyles = ({
  spacing,
  colors,
  fontSizes,
  fontWeights,
  shapes,
}: Theme) =>
  StyleSheet.create({
    header: {
      width: '100%',
      position: 'absolute',
      height: undefined,
      backgroundColor: colors.background,
      paddingTop: Platform.select({
        android: spacing[2],
      }),
    },
    container: {
      flex: 1,
    },
    headerText: {
      color: 'red',
    },
    wrapper: {
      // position: 'absolute',
      // zIndex: 100,
      paddingVertical: spacing['2'],
      paddingHorizontal: spacing['4'],
    },
    textField: {
      borderRadius: shapes.md,
      borderWidth: 1,
      backgroundColor: colors.surface,
      paddingVertical: 0,
      borderColor: colors.divider,
      width: '100%',
      // width: SCREEN_WIDTH * 0.9,
    },
    textFieldDisabled: {
      opacity: 0.5,
    },
    textFieldInput: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
    },
    listItemSubtitle: {
      fontSize: fontSizes.xs,
    },
    icon: {
      marginRight: -spacing[3],
    },
  });
