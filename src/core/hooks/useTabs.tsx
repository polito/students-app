import { useMemo, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface TabOptions {
  title: string;
  renderContent: () => JSX.Element;
}

export const useTabs = (options: TabOptions[]) => {
  const { colors } = useTheme();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const TabsComponent = useMemo(
    () => () =>
      (
        <Tabs
          selectedIndexes={[selectedTabIndex]}
          style={{
            backgroundColor: Platform.select({
              ios: colors.headers,
              android: colors.surface,
            }),
            borderBottomWidth: Platform.select({
              ios: StyleSheet.hairlineWidth,
            }),
            borderBottomColor: colors.divider,
            elevation: 3,
            zIndex: 1,
          }}
        >
          {options.map((o, i) => (
            <Tab key={i} onPress={() => setSelectedTabIndex(i)}>
              {o.title}
            </Tab>
          ))}
        </Tabs>
      ),
    [options, selectedTabIndex],
  );
  const TabsContent = useMemo(
    () => options[selectedTabIndex].renderContent,
    [options, selectedTabIndex],
  );
  return {
    selectedTabIndex,
    Tabs: TabsComponent,
    TabsContent,
  };
};
