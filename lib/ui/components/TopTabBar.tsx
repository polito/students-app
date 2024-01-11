import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

export const TopTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
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

          return (
            <Tab
              key={route.key}
              selected={isFocused}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={options.tabBarBadge?.() as string | number}
            >
              {label as string}
            </Tab>
          );
        })}
      </Tabs>
    </HeaderAccessory>
  );
};
