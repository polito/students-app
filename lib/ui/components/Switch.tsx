import { Platform, Switch as RNSwitch, SwitchProps } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const Switch = ({ children, ...rest }: SwitchProps) => {
  const { dark, palettes } = useTheme();
  return (
    <RNSwitch
      trackColor={{
        true: Platform.select({
          ios: palettes.secondary[500],
          android: palettes.secondary[dark ? 700 : 300],
        }),
        false:
          Platform.OS === 'android' && !dark ? palettes.muted[200] : undefined,
      }}
      thumbColor={Platform.select({ android: palettes.secondary[500] })}
      {...rest}
    >
      {children}
    </RNSwitch>
  );
};
