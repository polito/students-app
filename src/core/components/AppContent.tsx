import { useApiContext } from '../contexts/ApiContext';
import { GuestNavigator } from '../navigators/GuestNavigator';
import { RootNavigator } from '../navigators/RootNavigator';

export const AppContent = () => {
  const { isLogged } = useApiContext();

  return isLogged ? <RootNavigator /> : <GuestNavigator />;
};
