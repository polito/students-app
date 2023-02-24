import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetTicket,
  useMarkTicketAsRead,
} from '../../../core/queries/ticketHooks';
import { ChatMessage } from '../components/ChatMessage';
import { ServiceStackParamList } from '../components/ServiceNavigator';
import { TicketStatusInfo } from '../components/TicketStatusInfo';
import { TicketTextField } from '../components/TicketTextField';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Ticket'>;

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
  const [ticketStatusHeight, setTicketStatusHeight] = useState(0);

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

  const ticket = ticketQuery?.data?.data;

  const replies = useMemo(() => {
    return ticket?.replies.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [ticket]);

  const Header = () => {
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
        <TicketStatusInfo ticket={ticket} />
      </View>
    );
  };

  return (
    <>
      <FlatList
        ListFooterComponentStyle={styles.header}
        contentInsetAdjustmentBehavior="automatic"
        data={replies}
        contentContainerStyle={[
          bottomBarAwareStyles,
          { paddingBottom: ticketStatusHeight },
          { paddingTop: IS_ANDROID && bottomBarHeight },
        ]}
        keyExtractor={item => item.id.toString()}
        inverted
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
    </>
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
  });
