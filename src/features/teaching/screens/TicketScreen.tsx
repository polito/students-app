import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTicket } from '../../../core/queries/ticketHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Ticket'>;

export const TicketScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketQuery = useGetTicket(id);
  const refreshControl = useRefreshControl(ticketQuery);
  const ticket = ticketQuery?.data?.data;

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
