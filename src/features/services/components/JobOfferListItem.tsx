import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { JobOfferOverview } from '@polito/api-client';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { formatDate } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';

interface Props {
  jobOffer: JobOfferOverview;
  index: number;
  totalData: number;
}

export const JobOfferListItem = ({ jobOffer, index, totalData }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();

  const accessibilityLabel = accessibilityListLabel(totalData, index);
  // TODO: test android

  return (
    <ListItem
      title={getHtmlTextContent(jobOffer?.title)}
      titleStyle={styles.title}
      accessibilityLabel={accessibilityLabel}
      subtitle={
        <Col>
          <Text
            variant="secondaryText"
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t('jobOffersScreen.location', { location: jobOffer?.location })}
          </Text>
          <Text
            style={styles.companyInfos}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {jobOffer?.companyName} - {t('jobOffersScreen.endsAtDate')}
            {formatDate(jobOffer?.endsAtDate)}
          </Text>
        </Col>
      }
      subtitleStyle={styles.subtitle}
      trailingItem={
        <Icon
          icon={faChevronRight}
          color={colors.secondaryText}
          style={styles.icon}
        />
      }
    />
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights, palettes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    subtitle: {
      color: palettes.text['500'],
      fontWeight: fontWeights.medium,
      textTransform: 'capitalize',
      fontSize: fontSizes.sm,
      marginTop: spacing[0.5],
    },
    companyInfos: {
      color: palettes.text['400'],
      fontWeight: fontWeights.normal,
      fontSize: fontSizes.xs,
      marginTop: spacing[1],
    },
    icon: {
      marginRight: -spacing[1],
    },
  });
