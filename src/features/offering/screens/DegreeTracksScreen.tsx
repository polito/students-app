import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getTracksCoursesSections } from '../../../utils/offerings';
import { DegreeTrackYear } from '../components/DegreeTrackYear';
import { useDegreeContext } from '../contexts/DegreeContext';

export type OfferingCourseYear = {
  teachingYear: number;
  data: OfferingCourseOverview[];
};

type DegreeTrackSection = {
  title: string;
  isExpanded?: boolean;
  index: number;
  data: OfferingCourseYear[];
};

export const DegreeTracksScreen = () => {
  const bottomBarHeight = useBottomTabBarHeight();
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const { degreeId, year } = useDegreeContext();
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const { spacing, colors } = useTheme();
  const [sections, setSections] = useState<DegreeTrackSection[]>([]);
  const styles = useStylesheet(createStyles);
  const degree = degreeQuery?.data;

  useEffect(() => {
    if (!degreeQuery.isLoading) {
      setSections(getTracksCoursesSections(degree?.tracks));
    }
  }, [degree?.tracks, degreeQuery.isLoading]);

  const toggleSection = (toggleIndex: number) => {
    setSections(oldSections =>
      oldSections.map((section, index) => ({
        ...section,
        isExpanded: index === toggleIndex ? !section.isExpanded : false,
      })),
    );
  };

  return (
    <OverviewList
      loading={degreeQuery.isLoading}
      indented={true}
      style={{
        marginTop: spacing[4],
        marginBottom: bottomBarHeight + spacing[2],
      }}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={t('common.degreeTracksAndCourses')}
    >
      <SectionList
        refreshControl={<RefreshControl queries={[degreeQuery]} manual />}
        stickySectionHeadersEnabled
        sections={sections}
        keyExtractor={(item, index) => `${item.teachingYear}-${index}`}
        renderSectionFooter={({ section: { index } }) =>
          index !== sections.length - 1 ? <IndentedDivider indent={14} /> : null
        }
        initialNumToRender={2}
        renderSectionHeader={({ section: { title, index, isExpanded } }) => (
          <Pressable
            onPress={() => toggleSection(index)}
            accessibilityLabel={`${title}. ${t(
              isExpanded
                ? 'common.openedStatus.true'
                : 'common.openedStatus.false',
            )}. ${t(isExpanded ? 'common.openedStatusAction.true' : 'common.openedStatusAction.false')}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
            accessibilityHint={t('common.tapToToggleSection')}
          >
            <View
              style={{
                paddingLeft: safeAreaInsets.left,
                paddingRight: safeAreaInsets.right,
                ...styles.sectionHeader,
              }}
            >
              <SectionHeader
                title={title}
                titleStyle={styles.titleStyle}
                separator={false}
                trailingItem={
                  <Icon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    color={colors.secondaryText}
                  />
                }
              />
            </View>
          </Pressable>
        )}
        renderItem={({ item, section }) =>
          section?.isExpanded ? <DegreeTrackYear item={item} /> : null
        }
      />
    </OverviewList>
  );
};

const createStyles = ({ spacing, fontWeights, colors }: Theme) =>
  StyleSheet.create({
    sectionHeader: {
      paddingVertical: spacing[3],
      backgroundColor: colors.surface,
    },
    titleStyle: {
      fontWeight: fontWeights.medium,
    },
  });
