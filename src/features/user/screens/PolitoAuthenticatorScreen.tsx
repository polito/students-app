import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserStackParamList } from '../components/UserNavigator';
import { MfaAuthScreen } from './MfaAuthScreen';
import { MfaEnrollScreen } from './MfaEnrollScreen';

type Props = NativeStackScreenProps<UserStackParamList, 'PolitoAuthenticator'>;

export const PolitoAuthenticatorScreen = ({ route }: Props) => {
  const { activeView, challenge } = route.params;
  if (!activeView) return null;
  return activeView === 'enroll' ? (
    <MfaEnrollScreen />
  ) : activeView === 'auth' && challenge ? (
    <MfaAuthScreen challenge={challenge} />
  ) : null;
};
