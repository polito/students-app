import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getTracksCoursesGrouped } from '../../../utils/offerings';
import { DegreeTrackSection } from '../components/DegreeTrackSection';
import { useDegreeContext } from '../context/DegreeContext';

export type OfferingCourse = {
  teachingYear: number;
  data: OfferingCourseOverview[];
};

type DegreeTracksSection = {
  title: string;
  isExpanded?: boolean;
  index: number;
  data: OfferingCourse[];
};

export const DegreeTracksScreen = () => {
  const bottomBarHeight = useBottomTabBarHeight();
  const { degreeId, year } = useDegreeContext();
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const { spacing, colors, fontWeights } = useTheme();
  const { t } = useTranslation();
  const degree = degreeQuery?.data;
  const safeAreaInsets = useSafeAreaInsets();
  const isLoading = degreeQuery.isLoading;
  const sectionListRef =
    useRef<SectionList<OfferingCourse, DegreeTracksSection>>(null);
  const [sections, setSections] = useState<DegreeTracksSection[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setSections(getTracksCoursesGrouped(degree?.tracks));
    }
  }, [degree?.tracks, isLoading]);

  const toggleSection = (toggleIndex: number) => {
    setSections(oldSec =>
      oldSec.map((section, index) => {
        return {
          ...section,
          isExpanded: index === toggleIndex ? !section.isExpanded : false,
        };
      }),
    );
  };

  return (
    <OverviewList
      loading={isLoading}
      indented={true}
      style={{
        marginTop: spacing[4],
        marginBottom: bottomBarHeight + spacing[2],
      }}
    >
      <SectionList
        ref={sectionListRef}
        stickySectionHeadersEnabled
        sections={sections}
        keyExtractor={(item, index) => `${item.teachingYear}-${index}`}
        renderSectionFooter={({ section: { index } }) =>
          index !== sections.length - 1 ? <IndentedDivider indent={14} /> : null
        }
        renderSectionHeader={({ section: { title, index, isExpanded } }) => (
          <Pressable
            onPress={() => toggleSection(index)}
            accessibilityLabel={`${title}. ${t(
              `common.openedStatus.${isExpanded}`,
            )}. ${t(`common.openedStatusAction.${isExpanded}`)}`}
          >
            <View
              style={{
                paddingLeft: safeAreaInsets.left,
                paddingRight: safeAreaInsets.right,
                paddingVertical: spacing[3],
                backgroundColor: colors.surface,
              }}
            >
              <SectionHeader
                title={title}
                titleStyle={{ fontWeight: fontWeights.medium }}
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
          section?.isExpanded ? <DegreeTrackSection item={item} /> : null
        }
      />
    </OverviewList>
  );
};
