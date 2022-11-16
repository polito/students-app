import { useMemo, useRef } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import useStateRef from 'react-usestateref';

import { Tab } from '@lib/ui/components/Tab';
import { Tabs } from '@lib/ui/components/Tabs';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface TabsOptions {
  tabs: TabOptions[];
  animated?: boolean;
}

interface TabOptions {
  title: string;
  renderContent: () => JSX.Element;
}

export const useTabs = ({ tabs, animated = false }: TabsOptions) => {
  const { colors } = useTheme();
  const [selectedTabIndex, setSelectedTabIndex, selectedTabIndexRef] =
    useStateRef(0);
  const scrollViewRef = useRef<ScrollView>();
  const width = Dimensions.get('window').width;

  const TabsComponent = useMemo(
    () => () =>
      (
        <Tabs
          selectedIndexes={[selectedTabIndex]}
          style={{
            backgroundColor: colors.headers,
            borderBottomWidth: Platform.select({
              ios: StyleSheet.hairlineWidth,
            }),
            borderBottomColor: colors.divider,
            elevation: 3,
            zIndex: 1,
          }}
        >
          {tabs.map((o, i) => (
            <Tab
              key={i}
              onPress={() => {
                scrollViewRef.current.scrollTo({
                  x: width * i,
                  animated,
                });
              }}
              textStyle={{
                marginBottom: -2,
              }}
            >
              {o.title}
            </Tab>
          ))}
        </Tabs>
      ),
    [tabs, selectedTabIndex],
  );

  const tabsContent = useRef(() => (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      scrollEnabled={animated}
      bounces={false}
      contentContainerStyle={{
        width: width * tabs.length,
      }}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={60}
      onScroll={({ nativeEvent }) => {
        const currentTab = Math.max(
          0,
          Math.round(nativeEvent.contentOffset.x / width),
        );
        if (currentTab !== selectedTabIndexRef.current) {
          setSelectedTabIndex(currentTab);
        }
      }}
      decelerationRate="fast"
      pagingEnabled
    >
      {tabs.map(o => (
        <View key={o.title} style={{ width: width }}>
          {o.renderContent()}
        </View>
      ))}
    </ScrollView>
  ));
  return {
    selectedTabIndex,
    Tabs: TabsComponent,
    TabsContent: tabsContent.current,
  };
};
