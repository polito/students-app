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

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
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
  const { degreeId, year } = useDegreeContext();
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const { spacing, colors, fontWeights } = useTheme();
  const { t } = useTranslation();
  const degree = degreeQuery?.data?.data;
  const safeAreaInsets = useSafeAreaInsets();
  const isLoading = degreeQuery.isLoading;
  const sectionListRef =
    useRef<SectionList<OfferingCourse, DegreeTracksSection>>(null);
  const [sections, setSections] = useState<DegreeTracksSection[]>([]);

  const toggleSection = (sectionTitle: string) => {
    setSections(oldS => {
      return oldS.map((section, index) => {
        let isExpanded = false;
        let data: unknown = [];
        if (section.title === sectionTitle) {
          isExpanded = !section.isExpanded;
        }

        if (isExpanded && !section.data.length) {
          data = degree?.tracks?.[index]?.courses.reduce(
            (acc: OfferingCourse[], item: OfferingCourseOverview) => {
              const { teachingYear } = item;
              const offeringCourseIndex = acc.findIndex(
                i => i.teachingYear === teachingYear,
              );
              if (offeringCourseIndex > -1) {
                acc[offeringCourseIndex].data.push(item);
                return acc;
              } else {
                return [
                  ...acc,
                  {
                    teachingYear: teachingYear,
                    data: [item],
                  },
                ];
              }
            },
            [] as OfferingCourse[],
          );
        }

        return {
          title: section.title,
          isExpanded,
          data,
        } as DegreeTracksSection;
      });
    });
  };
  useEffect(() => {
    if (!isLoading) {
      setSections(() => {
        return (degree?.tracks || [])?.map((track, index) => {
          return {
            title: track.name,
            data: [],
            index,
            isExpanded: false,
          };
        });
      });
    }
  }, [isLoading, degree?.tracks]);

  return (
    <OverviewList
      loading={isLoading}
      indented={true}
      style={{ marginTop: spacing[4] }}
    >
      <SectionList
        ref={sectionListRef}
        stickySectionHeadersEnabled
        sections={sections}
        keyExtractor={(item, index) => `${item.teachingYear}-${index}`}
        renderSectionFooter={({ section: { index } }) =>
          index !== sections.length - 1 ? <IndentedDivider indent={14} /> : null
        }
        renderSectionHeader={({ section: { title, isExpanded } }) => (
          <Pressable
            onPress={() => toggleSection(title)}
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
        renderItem={({ item }) => <DegreeTrackSection item={item} />}
      />
    </OverviewList>
  );
};
