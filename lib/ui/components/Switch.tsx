import { Platform, Switch as RNSwitch, SwitchProps } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const Switch = ({ children, ...rest }: SwitchProps) => {
  const { dark, colors } = useTheme();
  return (
    <RNSwitch
      trackColor={{
        true: Platform.select({
          ios: colors.secondary[500],
          android: colors.secondary[dark ? 700 : 300],
        }),
        false:
          Platform.OS === 'android' && !dark ? colors.muted[200] : undefined,
      }}
      thumbColor={Platform.select({ android: colors.secondary[500] })}
      {...rest}
    >
      {children}
    </RNSwitch>
  );
};
