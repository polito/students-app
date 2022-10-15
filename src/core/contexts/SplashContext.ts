import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export interface SplashContextProps {
  isAppLoaded: boolean;
  setIsAppLoaded: Dispatch<SetStateAction<boolean>>;
}

export const SplashContext = createContext<SplashContextProps | undefined>(
  undefined,
);

export const useSplashContext = () => {
  const splashContext = useContext(SplashContext);
  if (!splashContext)
    throw new Error(
      'No SplashContext.Provider found when calling useSplashContext.',
    );
  return splashContext;
};
