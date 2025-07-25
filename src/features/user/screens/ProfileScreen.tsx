import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View } from 'react-native';

import {
  faAngleDown,
  faBell,
  faCog,
  faMessage,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Text } from '@lib/ui/components/Text';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Student } from '@polito/api-client';
import { MenuAction, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import {
  filterUnread,
  hasUnreadMessages,
} from '../../../../src/utils/messages';
import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { CardSwiper } from '../../../core/components/CardSwiper';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useLogout, useSwitchCareer } from '../../../core/queries/authHooks';
import {
  MESSAGES_QUERY_KEY,
  useGetMessages,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { CareerStatus } from '../components/CareerStatus';
import { UserStackParamList } from '../components/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'Profile'>;

type UserDetailsProps = {
  student?: Student;
};

const UserDetails = ({ student }: UserDetailsProps) => {
  const { t } = useTranslation();
  const { spacing, fontSizes } = useTheme();

  return (
    <Section accessible={false} style={{ marginTop: spacing[3] }}>
      <SectionHeader
        title={student?.lastName + ' ' + student?.firstName}
        subtitle={t('common.shortUsername') + ' ' + student?.username}
        titleStyle={{ fontSize: fontSizes.xl }}
        subtitleStyle={{ fontSize: fontSizes.lg }}
      />
    </Section>
  );
};

const HeaderRightDropdown = ({
  student,
  isOffline,
}: {
  student?: Student;
  isOffline: boolean;
}) => {
  const { mutate } = useSwitchCareer();
  const { t } = useTranslation();
  const { palettes, spacing } = useTheme();
  const username = student?.username || '';
  const allCareerIds = (student?.allCareerIds || []).map(id => `s${id}`);
  const canSwitchCareer = allCareerIds.length > 1 && !isOffline;
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
    if (event === username) return;
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
      <StatefulMenuView actions={actions} onPressAction={onPressAction}>
        <Row>
          <Text variant="link" style={{ marginRight: 5 }}>
            {username}
          </Text>
          {canSwitchCareer && (
            <Icon icon={faAngleDown} color={palettes.primary[500]} />
          )}
        </Row>
      </StatefulMenuView>
    </View>
  );
};

export const ProfileScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { firstRequest } = route.params;
  const { fontSizes } = useTheme();
  const { mutate: handleLogout } = useLogout();
  const studentQuery = useGetStudent();
  const student = studentQuery.data;
  const queryClient = useQueryClient();
  const messages = useGetMessages();

  const enrollmentYear = useMemo(() => {
    if (!student) return '...';
    return `${student.firstEnrollmentYear - 1}/${student.firstEnrollmentYear}`;
  }, [student]);

  const areMessagesMissing = useCallback(
    () => queryClient.getQueryData(MESSAGES_QUERY_KEY) === undefined,
    [queryClient],
  );
  const areMessagesDisabled = useOfflineDisabled(areMessagesMissing);

  const isOffline = useOfflineDisabled();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRightDropdown student={student} isOffline={isOffline} />
      ),
    });
  }, [isOffline, navigation, student]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl manual queries={[studentQuery]} />}
    >
      <SafeAreaView>
        <View
          accessible={true}
          accessibilityLabel={`${t('profileScreen.smartCard')}. ${t(
            'common.username',
          )} ${student?.username?.substring(1, student?.username?.length)}, ${
            student?.firstName
          } ${student?.lastName}`}
        >
          {student &&
          (student?.smartCardPicture ||
            student.europeanStudentCard.canBeRequested) ? (
            <CardSwiper student={student} firstRequest={firstRequest} />
          ) : (
            <UserDetails student={student} />
          )}
        </View>
        <Section accessible={false}>
          <SectionHeader
            title={t('common.career')}
            trailingItem={
              student?.status && <CareerStatus status={student?.status} />
            }
          />
          <OverviewList>
            <ListItem
              title={student?.degreeName ?? ''}
              subtitle={student?.degreeLevel + ' - ' + enrollmentYear}
              linkTo={{
                screen: 'Degree',
                params: {
                  id: student?.degreeId,
                  year: student?.firstEnrollmentYear,
                },
              }}
            />
          </OverviewList>
          <OverviewList indented>
            <ListItem
              title={t('notificationsScreen.title')}
              leadingItem={<Icon icon={faBell} size={fontSizes.xl} />}
              linkTo="Notifications"
            />
            <ListItem
              title={t('profileScreen.settings')}
              leadingItem={<Icon icon={faCog} size={fontSizes.xl} />}
              linkTo="Settings"
            />
            <ListItem
              title={t('messagesScreen.title')}
              leadingItem={<Icon icon={faMessage} size={fontSizes.xl} />}
              linkTo="Messages"
              disabled={areMessagesDisabled}
              trailingItem={
                messages.data && hasUnreadMessages(messages.data) ? (
                  <UnreadBadge text={filterUnread(messages.data).length} />
                ) : undefined
              }
            />
          </OverviewList>
          <CtaButton
            absolute={false}
            disabled={isOffline}
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
