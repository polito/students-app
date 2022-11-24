import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { faEnvelope, faLink, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Person } from '@polito/api-client/models/Person';
import { PersonAllOfCourses } from '@polito/api-client/models/PersonAllOfCourses';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { SCREEN_WIDTH } from '../../../utils/const';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Person'>;

export const PersonScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const personQuery = useGetPerson(id);
  const person: Person = personQuery?.data?.data || {};
  const courses: PersonAllOfCourses[] = person.courses;
  const source = {
    uri: person?.picture
      ? person?.picture
      : 'https://www.placecage.com/g/200/300',
  };

  navigation.setOptions({
    headerBackTitle: t('common.contacts'),
  });

  const PersonHeader = () => {
    const onPressProfileUrl = async () => {
      await Linking.openURL(person?.profileUrl);
    };

    return (
      <Col flexStart maxWidth style={styles.header}>
        <Text weight={'bold'} variant={'title'}>
          {person?.firstName} {person?.lastName}
        </Text>
        <Row noFlex mv-xl>
          <Image source={source} style={styles.image} />
          <Col flexStart style={styles.info}>
            <Text>{t('personScreen.role')}</Text>
            <Text weight={'semibold'}>{person.role}</Text>

            <Text style={styles.department}>
              {t('personScreen.department')}
            </Text>
            <Text weight={'semibold'}>{person.facilityShortName}</Text>

            {!!person?.profileUrl && (
              <Row alignCenter touchableOpacity onPress={onPressProfileUrl}>
                <View style={styles.icon}>
                  <Icon icon={faLink} size={20} color={colors.primary[400]} />
                </View>
                <Text style={styles.link}>{t('personScreen.moreInfo')}</Text>
              </Row>
            )}
          </Col>
        </Row>
      </Col>
    );
  };

  const onPressEmail = async () =>
    await Linking.openURL(`mailto:${person.email}`);

  const renderPhoneNumber = (phoneNumber: string) => {
    const onPressPhone = async () =>
      await Linking.openURL(`tel:${phoneNumber}`);

    return (
      <ListItem
        key={phoneNumber}
        titleStyle={styles.titleStyle}
        leadingItem={
          <Icon icon={faPhone} color={colors.text['500']} size={fontSizes.xl} />
        }
        title={t('personScreen.call')}
        subtitle={phoneNumber}
        onPress={onPressPhone}
      />
    );
  };

  const renderCourse = (course: PersonAllOfCourses) => {
    const onPressCourse = () => {
      console.debug('onPressCourse', course);
    };
    return (
      <ListItem
        key={course.id}
        titleStyle={styles.courseTitleStyle}
        title={course.name}
        isNavigationAction
        onPress={onPressCourse}
      />
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        marginTop: 10,
      }}
      refreshControl={<RefreshControl {...useRefreshControl(personQuery)} />}
      contentInsetAdjustmentBehavior="automatic"
    >
      <PersonHeader />
      <Section>
        <SectionHeader title={t('personScreen.contacts')} />
        <SectionList>
          {person?.phoneNumbers.map(renderPhoneNumber)}
          <ListItem
            titleStyle={styles.titleStyle}
            leadingItem={
              <Icon
                icon={faEnvelope}
                color={colors.text['500']}
                size={fontSizes.xl}
              />
            }
            title={t('personScreen.sentEmail')}
            subtitle={person?.email}
            onPress={onPressEmail}
          />
        </SectionList>
      </Section>
      <Section>
        <SectionHeader title={t('personScreen.courses')} />
        <SectionList>{courses.map(renderCourse)}</SectionList>
      </Section>
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
  StyleSheet.create({
    titleStyle: {
      color: colors.primary[400],
      fontWeight: '600',
    },
    courseTitleStyle: {
      fontWeight: '500',
      fontSize: fontSizes.md,
      color: colors.text['500'],
    },
    link: {
      color: colors.primary[400],
    },
    header: {
      paddingHorizontal: spacing['3'],
    },
    icon: {
      padding: spacing[1],
      flex: 0,
    },
    department: {
      marginTop: spacing[2],
    },
    info: {
      paddingLeft: spacing[4],
    },
    image: {
      width: SCREEN_WIDTH * 0.3,
      height: SCREEN_WIDTH * 0.3,
      borderRadius: SCREEN_WIDTH * 0.3,
    },
  });