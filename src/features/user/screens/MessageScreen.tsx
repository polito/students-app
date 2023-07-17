import { ScrollView } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetMessages } from '../../../core/queries/studentHooks';
import { MessageItem } from '../components/MessageItem';
import { UserStackParamList } from '../components/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'Message'>;

export const MessageScreen = ({ route }: Props) => {
  const { id } = route?.params || {};
  const messagesQuery = useGetMessages(true);
  const message = messagesQuery.data?.find(m => m.id === id);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      {message && <MessageItem message={message} />}
    </ScrollView>
  );
};
