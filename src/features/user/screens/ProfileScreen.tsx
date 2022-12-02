import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useLogout } from '../../../core/queries/authHooks';
import { useGetMe } from '../../../core/queries/studentHooks';
import {
  ProfileNotificationItem,
  ProfileSettingItem,
} from '../components/ProfileItems';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

const HeaderRightDropdown = () => {
  const username: string = 'aaaa';
  const allCareersUsernames: string[] = ['aaaa', 'bbbb', 'ccc'];

  const actions = useMemo((): MenuAction[] => {
    return allCareersUsernames.map(careerUsername => {
      return {
        id: careerUsername,
        title: careerUsername,
        state: careerUsername === username ? 'on' : undefined,
      };
    });
  }, []);

  const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
    console.debug('nativeEvent', event);
  };

  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      <Text variant={'link'}>{username}</Text>
    </MenuView>
  );
};

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const {
    mutate: handleLogout,
    isLoading: isLoadingLogout,
    isSuccess,
  } = useLogout();
  const useGetMeQuery = useGetMe();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const { refreshContext } = useApiContext();
  const client = useQueryClient();
  const onSuccessfulLogout = async () => {
    await Keychain.resetGenericPassword();
    await client.invalidateQueries([]);
    refreshContext();
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRightDropdown />,
    });
  }, []);

  useEffect(() => {
    if (isSuccess) {
      onSuccessfulLogout().catch(e => {
        // TODO handle error
      });
    }
  }, [isSuccess]);

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          { paddingBottom: bottomBarAwareStyles.paddingBottom + 40 },
          styles.listContainer,
        ]}
      >
        <Section>
          <Text weight={'bold'} variant={'title'} style={styles.title}>
            {/* {me?.firstName} {me?.lastName} */}
          </Text>
        </Section>
        <Section>
          <SectionHeader title={t('profileScreen.smartCard')} />
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
        loading={isLoadingLogout}
      />
    </>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['3xl'],
      paddingHorizontal: spacing[5],
    },
    listContainer: {
      marginTop: spacing[3],
    },
  });
