import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import * as Keychain from 'react-native-keychain';

import {
  faBell,
  faCog,
  faSignOut,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { useApiContext } from '../../../core/contexts/ApiContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useLogout } from '../../../core/queries/authHooks';
// import { useGetMe } from '../../../core/queries/studentHooks';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { mutate: handleLogout, isLoading, isSuccess } = useLogout();
  // const me = useGetMe();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes } = useTheme();
  const { refreshContext } = useApiContext();
  const client = useQueryClient();

  // console.log('student', me.data);
  const onSuccessfulLogout = async () => {
    await Keychain.resetGenericPassword();
    await client.invalidateQueries([]);
    refreshContext();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon={faSliders}
          color={colors.primary[400]}
          size={fontSizes.lg}
          adjustSpacing="right"
          accessibilityLabel={t('common.preferences')}
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
      ),
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
            Nome Cognome
          </Text>
        </Section>
        <Section>
          <SectionHeader title={t('profileScreen.smartCard')} />
        </Section>
        <Section>
          <SectionHeader title={t('profileScreen.course')} />
          <SectionList>
            <ListItem
              title={t('profileScreen.settings')}
              leadingItem={
                <Icon
                  icon={faCog}
                  color={colors.text['500']}
                  size={fontSizes.xl}
                />
              }
              linkTo={'Settings'}
            />
            <ListItem
              title={t('profileScreen.notifications')}
              linkTo={'Notifications'}
              leadingItem={
                <Icon
                  icon={faBell}
                  color={colors.text['500']}
                  size={fontSizes.xl}
                />
              }
            />
          </SectionList>
        </Section>
      </ScrollView>
      <CtaButton
        icon={faSignOut}
        title={t('common.logout')}
        action={() => handleLogout()}
        loading={isLoading}
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
