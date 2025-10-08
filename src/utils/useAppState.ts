import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus | null>(
    AppState.currentState,
  );

  const onAppStateChange = (state: AppStateStatus) => {
    setAppState(state);
  };

  useEffect(() => {
    const listener = AppState.addEventListener('change', onAppStateChange);

    return () => listener?.remove();
  }, []);

  return appState;
};
export default useAppState;
