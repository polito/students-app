import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, Platform, StyleSheet, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
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
  const { mutate: markAsRead } = useMarkTicketAsRead(id);
  const { spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const headerHeight = useHeaderHeight();
  const bottomBarHeight = useBottomTabBarHeight();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [ticketStatusHeight, setTicketStatusHeight] = useState(0);
  const ticket = ticketQuery?.data?.data;

  console.debug({ ticket });

  useEffect(markAsRead, []);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTicketStatusHeight(headerHeight);
    });
    return () => {
      hideSubscription.remove();
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight ticket={ticket} />,
    });
  }, [ticket]);

  const replies = useMemo(() => {
    return (
      ticket?.replies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ) || []
    );
  }, [ticket]);

  console.debug({ replies });

  const Header = () => {
    return (
      <View
        style={[
          styles.header,
          IS_IOS && { top: headerHeight },
          { height: keyboardVisible ? 0 : undefined },
          { opacity: keyboardVisible ? 0 : 1 },
        ]}
        onLayout={({ nativeEvent }) => {
          setTicketStatusHeight(
            nativeEvent.layout.height + (IS_IOS ? +spacing[3] : -headerHeight),
          );
        }}
      >
        {!!ticket?.subject && <SectionHeader title={ticket?.subject} />}
        <TicketStatusInfo ticket={ticket} loading={ticketQuery?.isLoading} />
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
          {
            paddingBottom: keyboardVisible ? -headerHeight : ticketStatusHeight,
          },
          { paddingTop: keyboardVisible || IS_ANDROID ? bottomBarHeight : 0 },
          { marginTop: keyboardVisible ? -bottomBarHeight : -bottomBarHeight },
        ]}
        keyExtractor={item => item.id.toString()}
        inverted
        ListFooterComponent={
          !ticketQuery?.isLoading &&
          !!ticket && <TicketRequest ticket={ticket} />
        }
        renderItem={({ item: reply }) => (
          <ChatMessage
            message={reply}
            ticketId={ticket.id}
            received={!!reply?.isFromAgent}
          />
        )}
      />
      <Header />
      <TicketTextField ticketId={id} />
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
