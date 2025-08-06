import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';

export const TopTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
  const { accessibility } = usePreferencesContext();
  return (
    <HeaderAccessory>
      <Tabs>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate({
                name: route.name,
                merge: true,
                params: {},
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const badgeElement = options.tabBarBadge?.();
          const badgeText =
            badgeElement && 'props' in badgeElement
              ? ((badgeElement as any).props.children as string | number)
              : undefined;

          return (
            <Tab
              key={route.key}
              selected={isFocused}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={badgeText}
              style={
                accessibility?.fontSize && accessibility.fontSize > 125
                  ? { paddingVertical: 0 }
                  : undefined
              }
            >
              {label as string}
            </Tab>
          );
        })}
      </Tabs>
    </HeaderAccessory>
  );
};
