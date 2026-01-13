import React from 'react';
import { SectionList, StyleProp, ViewStyle } from 'react-native';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
// import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
// import { Theme } from '@lib/ui/types/Theme';
import { UseQueryResult } from '@tanstack/react-query';

export type NestedListSection<TItem, TSection> = {
  title: string;
  isExpanded?: boolean;
  index: number;
  data: TItem[];
  sectionData?: TSection;
};

export type NestedListProps<TItem, TSection> = {
  sections: NestedListSection<TItem, TSection>[];
  loading?: boolean;
  queries: UseQueryResult[];
  onToggleSection: (index: number) => void;
  renderItem: (props: {
    item: TItem;
    section: NestedListSection<TItem, TSection>;
  }) => React.ReactElement | null;
  renderSectionHeader: (props: {
    section: NestedListSection<TItem, TSection>;
  }) => React.ReactElement;
  keyExtractor?: (item: TItem, index: number) => string;
  style?: StyleProp<ViewStyle>;
  indented?: boolean;
  accordionMode?: boolean;
};

export const NestedList = <TItem, TSection>({
  sections,
  loading,
  queries,
  // onToggleSection,
  renderItem,
  renderSectionHeader,
  keyExtractor = (_, index) => index.toString(),
  style,
  indented = true,
}: NestedListProps<TItem, TSection>) => {
  // const styles = useStylesheet(createStyles);

  return (
    <OverviewList loading={loading} indented={indented} style={style}>
      <SectionList
        refreshControl={<RefreshControl queries={queries} manual />}
        stickySectionHeadersEnabled
        sections={sections}
        keyExtractor={keyExtractor}
        renderSectionFooter={({ section: { index } }) =>
          index !== sections.length - 1 ? (
            <IndentedDivider indent={indented ? 14 : 0} />
          ) : null
        }
        initialNumToRender={2}
        renderSectionHeader={({ section }) => renderSectionHeader({ section })}
        renderItem={({ item, section }) => renderItem({ item, section })}
      />
    </OverviewList>
  );
};

// const createStyles = ({ spacing }: Theme) =>
//   StyleSheet.create({
//     list: {
//       flex: 1,
//     },
//   });

export default NestedList;
