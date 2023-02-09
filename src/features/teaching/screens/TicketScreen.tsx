import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTicket } from '../../../core/queries/ticketHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Ticket'>;

export const TicketScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketQuery = useGetTicket(id);
  const refreshControl = useRefreshControl(ticketQuery);
  const ticket = ticketQuery?.data?.data;
  const confirm = useConfirmationDialog();
  const routes = navigation.getState()?.routes;

  useEffect(() => {
    // if (routes[routes.length - 2]?.name === 'Course') {
    //   navigation.setOptions({
    //     headerBackTitle: t('common.course'),
    //   });
    // }
  }, []);

  const action = async () => {
    // if (examAvailable) {
    //   return bookExam({});
    // }
    // if (await confirm()) {
    //   return cancelBooking();
    // }
    // return Promise.reject();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <EventDetails
          title={ticket?.subject}
          type={t('common.exam')}
          time={ticket?.updatedAt}
        />
      </ScrollView>
    </>
  );
};
