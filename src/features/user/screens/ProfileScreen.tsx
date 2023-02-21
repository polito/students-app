import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { faAngleDown, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Student } from '@polito/api-client';
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IS_ANDROID, SCREEN_WIDTH } from '../../../core/constants';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useLogout, useSwitchCareer } from '../../../core/queries/authHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import {
  ProfileNotificationItem,
  ProfileSettingItem,
} from '../components/ProfileItems';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

const HeaderRightDropdown = ({ student }: { student?: Student }) => {
  const { mutate } = useSwitchCareer();
  const { colors } = useTheme();
  const username = student?.username || '';
  const allCareerIds = (student?.allCareerIds || []).map(id => `s${id}`);
  const actions = useMemo((): MenuAction[] => {
    return allCareerIds.map(careerId => {
      return {
        id: careerId,
        title: careerId,
        state: careerId === username ? 'on' : undefined,
      };
    });
  }, [allCareerIds, username]);

  const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
    mutate({ username: event });
  };

  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      <Row>
        <Text variant={'link'} style={{ marginRight: 5 }}>
          {username}
        </Text>
        {allCareerIds?.length > 0 && (
          <Icon icon={faAngleDown} color={colors.primary[500]} />
        )}
      </Row>
    </MenuView>
  );
};

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { mutate: handleLogout, isLoading } = useLogout();
  const useGetMeQuery = useGetStudent();
  const student = useGetMeQuery?.data?.data;
  const scrollViewStyle = useScrollViewStyle();

  const styles = useStylesheet(createStyles);
  const refreshControl = useRefreshControl(useGetMeQuery);
  const firstEnrollmentYear = student?.firstEnrollmentYear;
  const enrollmentYear = student
    ? `${firstEnrollmentYear - 1}/${firstEnrollmentYear}`
    : '...';

  let bottomBarHeight = 0;
  try {
    bottomBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // Not available in this context
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRightDropdown student={student} />,
    });
  }, [student]);

  return (
    <Col>
      <ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        style={scrollViewStyle}
        contentContainerStyle={{
          paddingBottom: bottomBarHeight + +spacing['16'],
        }}
      >
        <Section>
          <Text weight={'bold'} variant={'title'} style={styles.title}>
            {student?.firstName} {student?.lastName}
          </Text>
        </Section>
        <Section>
          <SectionHeader title={t('profileScreen.smartCard')} />
          <View style={{ marginTop: Platform.select({ ios: spacing[3] }) }}>
            <ImageLoader
              imageStyle={styles.smartCard}
              source={{ uri: student?.smartCardPicture }}
            />
          </View>
        </Section>
        <Section>
          <SectionHeader
            title={t('profileScreen.course')}
            /* trailingItem={
                                      <Text variant="link">{t('profileScreen.trainingOffer')}</Text>
                                    }*/
            trailingItem={<Badge text={t('common.comingSoon')} />}
          />
          <SectionList>
            <ListItem
              title={student?.degreeName}
              subtitle={t('profileScreen.enrollmentYear', { enrollmentYear })}
              // linkTo={'TODO'}
            />
          </SectionList>
          <SectionList>
            <ProfileSettingItem />
            <ProfileNotificationItem />
          </SectionList>
        </Section>
        <CtaButton
          icon={faSignOut}
          title={t('common.logout')}
          action={handleLogout}
          loading={isLoading}
        />
      </ScrollView>
    </Col>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['3xl'],
      paddingHorizontal: spacing[5],
      paddingTop: spacing[IS_ANDROID ? 4 : 1],
    },
    listContainer: {
      marginTop: spacing[3],
    },
    smartCardContainer: {},
    smartCard: {
      height: (SCREEN_WIDTH - Number(spacing[10])) / 1.583,
      marginVertical: spacing[IS_ANDROID ? 3 : 1],
    },
  });
