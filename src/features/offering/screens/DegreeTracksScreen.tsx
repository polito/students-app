import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { NestedList, NestedListSection } from '@lib/ui/components/NestedList';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { OfferingCourseOverview } from '@polito/api-client';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getTracksCoursesSections } from '../../../utils/offerings';
import { DegreeTrackYear } from '../components/DegreeTrackYear';
import { useDegreeContext } from '../contexts/DegreeContext';

export type OfferingCourseYear = {
  teachingYear: number;
  data: OfferingCourseOverview[];
};

type DegreeTrackSection = NestedListSection<OfferingCourseYear, never>;

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

  const renderSectionHeader = ({
    section,
  }: {
    section: DegreeTrackSection;
  }) => (
    <Pressable
      onPress={() => toggleSection(section.index)}
      accessibilityLabel={`${section.title}. ${t(
        `common.openedStatus.${section.isExpanded}`,
      )}. ${t(`common.openedStatusAction.${section.isExpanded}`)}`}
    >
      <View
        style={{
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
          ...styles.sectionHeader,
        }}
      >
        <SectionHeader
          title={section.title}
          titleStyle={styles.titleStyle}
          separator={false}
          trailingItem={
            <Icon
              icon={section.isExpanded ? faChevronUp : faChevronDown}
              color={colors.secondaryText}
            />
          }
        />
      </View>
    </Pressable>
  );

  const renderItem = ({
    item,
    section,
  }: {
    item: OfferingCourseYear;
    section: DegreeTrackSection;
  }) => (section.isExpanded ? <DegreeTrackYear item={item} /> : null);

  return (
    <NestedList
      sections={sections}
      loading={degreeQuery.isLoading}
      queries={[degreeQuery]}
      onToggleSection={toggleSection}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item, index) => `${item.teachingYear}-${index}`}
      style={{
        marginTop: spacing[4],
        marginBottom: bottomBarHeight + spacing[2],
      }}
      indented={true}
    />
  );
};

const createStyles = ({ spacing, fontWeights, colors }: Theme) =>
  StyleSheet.create({
    sectionHeader: {
      paddingVertical: spacing[3],
      backgroundColor: colors.background,
    },
    titleStyle: {
      fontWeight: fontWeights.medium,
    },
  });
