import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';

import { GroupCoursesExpanded } from './GroupCoursesExpanded';

interface GroupCoursesProps {
  group: { name: string; data: OfferingCourseOverview[] };
}

export const GroupCourses = ({ group }: GroupCoursesProps) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Col style={styles.container}>
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <Row justify="space-between" align="center">
          <Text variant="title" style={styles.title}>
            {group.name}
          </Text>
          <Icon
            icon={isExpanded ? faChevronDown : faChevronRight}
            color={colors.secondaryText}
            style={styles.icon}
          />
        </Row>
      </Pressable>
      {isExpanded && <GroupCoursesExpanded courses={group.data} />}
    </Col>
  );
};

const createStyles = ({
  spacing,
  fontSizes,
  fontWeights,
  colors,
  palettes,
  dark,
}: Theme) =>
  StyleSheet.create({
    icon: {
      marginRight: -spacing[1],
    },
    subHeading: {
      color: dark ? palettes.info['400'] : palettes.info['700'],
      marginBottom: spacing[2],
      marginHorizontal: spacing[4],
      textTransform: 'none',
    },
    container: {
      backgroundColor: dark ? colors.surfaceDark : palettes.gray['100'],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    title: {
      fontSize: fontSizes.md,
      lineHeight: fontSizes.md * 1.4,
      fontWeight: fontWeights.medium,
      maxWidth: '80%',
    },
  });
