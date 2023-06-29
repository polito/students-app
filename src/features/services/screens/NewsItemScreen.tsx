import { useTranslation } from 'react-i18next';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Document } from 'react-native-render-html';

import {
  faCalendarAlt,
  faFileAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { parseDocument } from 'htmlparser2';

import { HtmlView } from '../../../core/components/HtmlView';
import { useGetNewsItem } from '../../../core/queries/newsHooks';
import { formatDate, formatDateFromString } from '../../../utils/dates';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'NewsItem'>;

export const NewsItemScreen = ({ route }: Props) => {
  const { id } = route?.params || {};
  const { palettes, spacing, colors } = useTheme();
  const { t } = useTranslation();
  const useNewsItemQuery = useGetNewsItem(id);
  const { data: newsItem, isLoading } = useNewsItemQuery;
  const styles = useStylesheet(createStyles);
  const { title, eventStartTime, createdAt, htmlContent } = newsItem || {};

  const dom = parseDocument(htmlContent ?? '') as Document;
  const links = newsItem?.extras.filter(e => ['link', 'file'].includes(e.type));
  const logo = newsItem?.extras.find(
    e => e.type === 'image' && e.description === 'Logo1',
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[useNewsItemQuery]} manual />}
    >
      <Section>
        <ScreenTitle title={title ?? ''} style={styles.heading} />
        {isLoading && (
          <ActivityIndicator
            style={{
              marginVertical: spacing[6],
            }}
          />
        )}
      </Section>
      {!isLoading && (
        <>
          {createdAt && (
            <Card accessible padded>
              <Text variant="heading" weight="semibold" numberOfLines={1}>
                {t('newsScreen.createdAt')}
                {formatDate(createdAt)}
              </Text>
            </Card>
          )}
          {!!logo && (
            <Card
              accessible
              accessibilityLabel={t('newsScreen.logo')}
              accessibilityRole="image"
            >
              <ImageLoader
                source={{ uri: logo.url }}
                imageStyle={{ height: 200 }}
                containerStyle={{ height: 200, margin: spacing[3] }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Card>
          )}
          {htmlContent && (
            <Card accessible>
              <HtmlView source={{ dom }} />
            </Card>
          )}
          <Card padded>
            <Text
              variant="subHeading"
              weight="semibold"
              style={{ marginBottom: spacing[1] }}
            >
              {t('newsScreen.information')}
            </Text>
            <Col>
              {eventStartTime && (
                <Row style={styles.infoRow} accessible accessibilityRole="text">
                  <Icon
                    icon={faCalendarAlt}
                    style={styles.iconCalendar}
                    color={palettes.secondary[600]}
                  />
                  <Text
                    weight="normal"
                    accessibilityLabel={[
                      t('newsScreen.eventStartTime'),
                      formatDateFromString(eventStartTime),
                    ].join(' ')}
                  >
                    {formatDateFromString(eventStartTime)}
                  </Text>
                </Row>
              )}
              {links?.map((link, index) => (
                <TouchableHighlight
                  underlayColor={colors.touchableHighlight}
                  onPress={() => Linking.openURL(link.url)}
                  key={index}
                  accessible
                  accessibilityRole="link"
                  style={styles.infoRow}
                >
                  <Row align="center">
                    <Icon
                      icon={link.type === 'link' ? faInfoCircle : faFileAlt}
                      style={styles.iconCalendar}
                      color={palettes.secondary[600]}
                    />
                    <Text weight="normal" variant="link" style={styles.link}>
                      {link.description}
                    </Text>
                  </Row>
                </TouchableHighlight>
              ))}
            </Col>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
    },
    infoRow: {
      marginVertical: spacing[1],
      paddingVertical: spacing[2],
    },
    iconCalendar: {
      marginRight: spacing[2],
    },
    link: {
      textDecorationLine: 'underline',
      maxWidth: '90%',
    },
  });
