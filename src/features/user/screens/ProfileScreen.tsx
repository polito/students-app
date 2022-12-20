import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { faAngleDown, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
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
import { Student } from '@polito/api-client';
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  const allCareersUsernames = student?.allCareerUsernames || [];
  const actions = useMemo((): MenuAction[] => {
    return allCareersUsernames.map(careerUsername => {
      return {
        id: careerUsername,
        title: careerUsername,
        state: careerUsername === username ? 'on' : undefined,
      };
    });
  }, [allCareersUsernames, username]);

  const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
    mutate({ username: event });
  };

  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      <Row>
        <Text variant={'link'} style={{ marginRight: 5 }}>
          {username}
        </Text>
        {allCareersUsernames?.length > 0 && (
          <Icon icon={faAngleDown} color={colors.primary[500]} />
        )}
      </Row>
    </MenuView>
  );
};

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { mutate: handleLogout, isLoading } = useLogout();
  const useGetMeQuery = useGetStudent();
  const student = useGetMeQuery?.data?.data;
  const scrollViewStyle = useScrollViewStyle();

  const styles = useStylesheet(createStyles);
  const refreshControl = useRefreshControl(useGetMeQuery);

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
      >
        <Section>
          <Text weight={'bold'} variant={'title'} style={styles.title}>
            {student?.firstName} {student?.lastName}
          </Text>
        </Section>
        <Section>
          <SectionHeader title={t('profileScreen.smartCard')} />
          {/* <Image source={{uri: student?.smartCardPicture}} /> */}
        </Section>
        <Section>
          <SectionHeader
            title={t('profileScreen.course')}
            trailingItem={
              <Text variant="link">{t('profileScreen.trainingOffer')}</Text>
            }
          />
          <SectionList>
            <ListItem
              title={t('profileScreen.settings')}
              subtitle={'Area di immatricolazione'}
              linkTo={'Settings'}
            />
          </SectionList>
          <SectionList>
            <ProfileSettingItem />
            <ProfileNotificationItem />
          </SectionList>
        </Section>
      </ScrollView>
      <CtaButton
        icon={faSignOut}
        title={t('common.logout')}
        action={() => handleLogout()}
        loading={isLoading}
      />
    </Col>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['3xl'],
      paddingHorizontal: spacing[5],
    },
    listContainer: {
      marginTop: spacing[3],
    },
  });
