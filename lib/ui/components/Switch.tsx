import { Platform, Switch as RNSwitch, SwitchProps } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const Switch = ({ children, ...rest }: SwitchProps) => {
  const { dark, palettes } = useTheme();
  return (
    <RNSwitch
      trackColor={{
        true: Platform.select({
          ios: palettes.primary[dark ? 400 : 500],
          android: palettes.primary[400],
        }),
        false:
          Platform.OS === 'android' && !dark ? palettes.muted[200] : undefined,
      }}
      thumbColor={Platform.select({
        android: palettes.primary[500],
      })}
      style={{ opacity: 1 }}
      {...rest}
    >
      {children}
    </RNSwitch>
  );
};
