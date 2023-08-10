import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import {
  faAngleDown,
  faBell,
  faCog,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Student } from '@polito/api-client';
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { IS_ANDROID } from '../../../core/constants';
import { useLogout, useSwitchCareer } from '../../../core/queries/authHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

const HeaderRightDropdown = ({ student }: { student?: Student }) => {
  const { mutate } = useSwitchCareer();
  const { t } = useTranslation();
  const { palettes, spacing } = useTheme();
  const username = student?.username || '';
  const allCareerIds = (student?.allCareerIds || []).map(id => `s${id}`);
  const canSwitchCareer = allCareerIds.length > 1;

  const actions = useMemo((): MenuAction[] => {
    if (!canSwitchCareer) return [];

    return allCareerIds.map(careerId => {
      return {
        id: careerId,
        title: careerId,
        state: careerId === username ? 'on' : undefined,
      };
    });
  }, [canSwitchCareer, allCareerIds, username]);

  const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
    mutate({ username: event });
  };

  return (
    <View
      style={{ padding: spacing[2] }}
      accessible={true}
      accessibilityRole={canSwitchCareer ? 'button' : 'text'}
      accessibilityLabel={`${t('common.username')} ${username} ${
        canSwitchCareer ? t('common.switchCareerLabel') : ''
      }`}
    >
      <MenuView actions={actions} onPressAction={onPressAction}>
        <Row>
          <Text variant="link" style={{ marginRight: 5 }}>
            {username}
          </Text>
          {canSwitchCareer && (
            <Icon icon={faAngleDown} color={palettes.primary[500]} />
          )}
        </Row>
      </MenuView>
    </View>
  );
};

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const { mutate: handleLogout } = useLogout();
  const studentQuery = useGetStudent();
  const student = studentQuery.data;

  const styles = useStylesheet(createStyles);
  const enrollmentYear = useMemo(() => {
    if (!student) return '...';
    return `${student.firstEnrollmentYear - 1}/${student.firstEnrollmentYear}`;
  }, [student]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRightDropdown student={student} />,
    });
  }, [navigation, student]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[studentQuery]} />}
    >
      <SafeAreaView>
        <Section style={styles.header}>
          <Text weight="bold" variant="title" style={styles.title}>
            {student?.firstName} {student?.lastName}
          </Text>
          <Text variant="secondaryText">
            {t('profileScreen.careerStatus')}{' '}
            {t(
              `profileScreen.careerStatusEnum.${student?.status}`,
            ).toLowerCase()}
          </Text>
        </Section>
        <View
          accessible={true}
          accessibilityLabel={`${t('profileScreen.smartCard')}. ${t(
            'common.username',
          )} ${student?.username?.substring(1, student?.username?.length)}, ${
            student?.firstName
          } ${student?.lastName}`}
        >
          <Section accessible={false}>
            <SectionHeader title={t('profileScreen.smartCard')} />
            <Col ph={5} pv={2}>
              <FastImage
                style={styles.smartCard}
                source={{ uri: student?.smartCardPicture }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </Col>
          </Section>
        </View>
        <Section accessible={false}>
          <SectionHeader
            title={student?.degreeLevel ?? t('profileScreen.course')}
            trailingItem={<Badge text={t('common.comingSoon')} />}
          />
          <OverviewList>
            {/* //TODO: handle degreeId */}
            <ListItem
              title={student?.degreeName ?? ''}
              subtitle={t('profileScreen.enrollmentYear', { enrollmentYear })}
              linkTo={{
                screen: 'Degree',
                params: {
                  degreeId: student?.degreeCode,
                  year: student?.firstEnrollmentYear,
                },
              }}
            />
          </OverviewList>
          <OverviewList indented>
            <ListItem
              title={t('profileScreen.settings')}
              leadingItem={<Icon icon={faCog} size={fontSizes.xl} />}
              linkTo="Settings"
            />
            <ListItem
              title={t('messagesScreen.title')}
              leadingItem={<Icon icon={faBell} size={fontSizes.xl} />}
              linkTo="Messages"
            />
          </OverviewList>
          <CtaButton
            absolute={false}
            title={t('common.logout')}
            action={handleLogout}
            icon={faSignOut}
          />
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
    header: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[IS_ANDROID ? 4 : 1],
    },
    smartCard: {
      aspectRatio: 1.5817,
      height: undefined,
      maxWidth: 540, // width of a physical card in dp
      maxHeight: 341,
    },
  });
