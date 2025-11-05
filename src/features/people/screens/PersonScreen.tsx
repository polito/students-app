import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  faEnvelope,
  faLink,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PersonCourse, PhoneNumber } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { notNullish } from '../../../utils/predicates';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Person'>;

const profileImageSize = 120;

export const PersonScreen = ({ route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const personQuery = useGetPerson(id);
  const { accessibilityListLabel } = useAccessibility();
  const openInAppLink = useOpenInAppLink();
  const person = personQuery.data;
  const fullName = [person?.firstName, person?.lastName]
    .filter(notNullish)
    .join(' ');
  const courses = person?.courses ?? [];
  const phoneNumbers = person?.phoneNumbers;

  const isOffline = useOfflineDisabled();

  const profileImageAccessibleLabel = [
    t('common.profilePic'),
    person?.firstName,
    person?.lastName,
    person?.picture ? '' : t('common.noImage'),
  ]
    .filter(notNullish)
    .join(', ');

  const header = (
    <Col ph={5} gap={6} mb={6}>
      <Text
        weight="bold"
        variant="title"
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={`${fullName}, ${person?.role || ''}`}
      >
        {fullName}
      </Text>
      {(!person ||
        !!person?.picture ||
        !!person?.role ||
        !!person?.facilityShortName ||
        !!person?.profileUrl) && (
        <Row gap={6}>
          <View
            accessible={true}
            accessibilityLabel={profileImageAccessibleLabel}
          >
            {person?.picture ? (
              <Image
                source={{ uri: person.picture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon
                  icon={faUser}
                  size={fontSizes['3xl']}
                  color={colors.title}
                />
              </View>
            )}
          </View>
          <Col style={styles.info}>
            {person?.role && (
              <Metric
                title={t('personScreen.role')}
                value={person.role}
                style={styles.spaceBottom}
                accessible={true}
              />
            )}
            {person?.facilityShortName && (
              <Metric
                title={t('personScreen.department')}
                value={person.facilityShortName}
                style={styles.spaceBottom}
                accessible={true}
              />
            )}

            {person?.profileUrl && (
              <TouchableOpacity
                onPress={() => openInAppLink(person.profileUrl)}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={t('personScreen.moreInfo')}
                accessibilityHint={t('common.externalLink')}
              >
                <Row align="center">
                  <Icon
                    icon={faLink}
                    size={20}
                    color={colors.link}
                    style={styles.linkIcon}
                  />
                  <Text variant="link">{t('personScreen.moreInfo')}</Text>
                </Row>
              </TouchableOpacity>
            )}
          </Col>
        </Row>
      )}
    </Col>
  );

  const renderPhoneNumber = (phoneNumber: PhoneNumber, index: number) => {
    const phoneLabel = [phoneNumber.full, phoneNumber?.internal]
      .filter(notNullish)
      .join(' / ');
    return (
      <ListItem
        accessible={true}
        accessibilityRole="button"
        key={index}
        isAction
        leadingItem={<Icon icon={faPhone} size={fontSizes.xl} />}
        title={t('common.phone')}
        subtitle={phoneLabel}
        accessibilityLabel={`${accessibilityListLabel(
          index,
          phoneNumbers?.length || 0,
        )}. ${t('personScreen.call')} ${phoneLabel}`}
        accessibilityHint={t('personScreen.call')}
        onPress={() => Linking.openURL(`tel:${phoneNumber.full}`)}
      />
    );
  };

  interface RenderedCourseProps {
    course: PersonCourse;
    index: number;
    disabled: boolean;
  }

  const RenderedCourse = ({ course, index, disabled }: RenderedCourseProps) => {
    const role = course.role === 'Titolare' ? 'roleHolder' : 'roleCollaborator';

    return (
      <ListItem
        accessible={true}
        accessibilityRole="button"
        title={course.name}
        subtitle={`${course.year} - ${t('common.' + role)}`}
        isAction
        accessibilityLabel={`${accessibilityListLabel(
          index,
          courses?.length || 0,
        )}. ${course.name}, ${course.year} -${t('common.' + role)}`}
        linkTo={{
          screen: 'DegreeCourse',
          params: {
            courseShortcode: course.shortcode,
            year: course.year,
          },
        }}
        disabled={disabled}
      />
    );
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl queries={[personQuery]} manual />}
      contentInsetAdjustmentBehavior="automatic"
    >
      <SafeAreaView>
        <Col pv={5}>
          {header}
          <Section>
            <SectionHeader
              title={t('personScreen.contacts')}
              accessible={true}
              accessibilityLabel={`${t('personScreen.contacts')}. ${
                phoneNumbers?.length
                  ? `${phoneNumbers.length} ${t('common.phone')}, `
                  : ''
              }${t('common.email')}`}
            />
            <OverviewList
              indented
              loading={personQuery.isLoading}
              accessible={true}
              accessibilityRole="list"
            >
              {phoneNumbers?.map(renderPhoneNumber)}
              <ListItem
                accessible={true}
                accessibilityRole="button"
                isAction
                leadingItem={<Icon icon={faEnvelope} size={fontSizes.xl} />}
                title={t('common.email')}
                subtitle={person?.email}
                accessibilityLabel={`${t('personScreen.sentEmail')} ${person?.email}`}
                accessibilityHint={t('personScreen.sentEmail')}
                onPress={() => Linking.openURL(`mailto:${person?.email}`)}
              />
            </OverviewList>
          </Section>
          {courses.length > 0 && (
            <Section>
              <SectionHeader
                title={t('common.course_plural')}
                accessible={true}
                accessibilityLabel={`${t('personScreen.coursesLabel')}. ${t(
                  'personScreen.totalCourses',
                  { total: courses.length },
                )}`}
              />
              <OverviewList accessible={true} accessibilityRole="list">
                {courses.map((course, index) => (
                  <RenderedCourse
                    key={course.id}
                    course={course}
                    index={index}
                    disabled={isOffline}
                  />
                ))}
              </OverviewList>
            </Section>
          )}
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) => {
  const profileImage = {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize,
  };
  return StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
    info: {
      flex: 1,
      justifyContent: 'center',
      flexDirection: 'column',
    },
    profileImage,
    profileImagePlaceholder: {
      ...profileImage,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    linkIcon: {
      marginRight: spacing[2],
    },
  });
};
