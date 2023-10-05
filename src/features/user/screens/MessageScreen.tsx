import { ScrollView } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetMessages } from '../../../core/queries/studentHooks';
import { MessageScreenContent } from '../components/MessageScreenContent';
import { UserStackParamList } from '../components/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'Message'>;

export const MessageScreen = ({ route }: Props) => {
  const { id } = route?.params || {};
  const messagesQuery = useGetMessages();
  const message = messagesQuery.data?.find(m => m.id === id);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      {message && <MessageScreenContent message={message} />}
      <BottomBarSpacer />
    </ScrollView>
  );
};
