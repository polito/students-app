import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  faAngleDown,
  faBell,
  faCog,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IS_ANDROID } from '../../../core/constants';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useLogout, useSwitchCareer } from '../../../core/queries/authHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

const HeaderRightDropdown = ({ student }: { student?: Student }) => {
  const { mutate } = useSwitchCareer();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
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
  }, [allCareerIds, username]);

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
          <Text variant={'link'} style={{ marginRight: 5 }}>
            {username}
          </Text>
          {canSwitchCareer && (
            <Icon icon={faAngleDown} color={colors.primary[500]} />
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
  const useGetMeQuery = useGetStudent();
  const student = useGetMeQuery?.data?.data;

  const styles = useStylesheet(createStyles);
  const refreshControl = useRefreshControl(useGetMeQuery);
  const firstEnrollmentYear = student?.firstEnrollmentYear;
  const enrollmentYear = student
    ? `${firstEnrollmentYear - 1}/${firstEnrollmentYear}`
    : '...';

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRightDropdown student={student} />,
    });
  }, [student]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section>
        <Text weight="bold" variant="title" style={styles.title}>
          {student?.firstName} {student?.lastName}
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
          <ImageLoader
            imageStyle={styles.smartCard}
            source={{ uri: student?.smartCardPicture }}
            containerStyle={styles.smartCardContainer}
          />
        </Section>
      </View>
      <Section accessible={false}>
        <SectionHeader
          title={t('profileScreen.course')}
          trailingItem={<Badge text={t('common.comingSoon')} />}
        />
        <SectionList>
          <ListItem
            title={student?.degreeName}
            subtitle={t('profileScreen.enrollmentYear', { enrollmentYear })}
          />
        </SectionList>
        <SectionList>
          <ListItem
            title={t('profileScreen.settings')}
            leadingItem={<Icon icon={faCog} size={fontSizes.xl} />}
            linkTo={'Settings'}
          />
          <ListItem
            title={t('messagesScreen.title')}
            leadingItem={<Icon icon={faBell} size={fontSizes.xl} />}
            linkTo={'Notifications'}
          />
        </SectionList>
        <CtaButton
          absolute={false}
          title={t('common.logout')}
          action={handleLogout}
          icon={faSignOut}
        />
      </Section>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
      paddingHorizontal: spacing[5],
      paddingTop: spacing[IS_ANDROID ? 4 : 1],
    },
    smartCard: {
      aspectRatio: 1.586,
      height: null,
    },
    smartCardContainer: {
      marginVertical: spacing[2],
      marginHorizontal: spacing[5],
      maxWidth: 540, // width of a physical card in dp
    },
  });
