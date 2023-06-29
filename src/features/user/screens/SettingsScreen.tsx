import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { stat, unlink } from 'react-native-fs';

import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faBroom,
  faCalendarDay,
  faCircleExclamation,
  faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView } from '@react-native-menu/menu';

import i18next from 'i18next';
import { Settings } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useDeviceLanguage } from '../../../core/hooks/useDeviceLanguage';
import { lightTheme } from '../../../core/themes/light';
import { formatFileSize } from '../../../utils/files';
import { useCoursesFilesCachePath } from '../../teaching/hooks/useCourseFilesCachePath';

const CleanCacheListItem = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const filesCache = useCoursesFilesCachePath();
  const [cacheSize, setCacheSize] = useState<number>();
  const confirm = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('settingsScreen.cleanCacheConfirmMessage'),
  });
  const refreshSize = () => {
    if (filesCache) {
      stat(filesCache)
        .then(({ size }) => {
          setCacheSize(size);
        })
        .catch(() => {
          setCacheSize(0);
        });
    }
  };

  useEffect(refreshSize, [filesCache]);
  return (
    <ListItem
      isAction
      title={t('common.cleanCourseFiles')}
      subtitle={t('coursePreferencesScreen.cleanCourseFilesSubtitle', {
        size: cacheSize == null ? '-- MB' : formatFileSize(cacheSize),
      })}
      accessibilityRole="button"
      disabled={cacheSize === 0}
      leadingItem={<Icon icon={faBroom} size={fontSizes['2xl']} />}
      onPress={async () => {
        if (filesCache && (await confirm())) {
          await unlink(filesCache);
          refreshSize();
        }
      }}
    />
  );
};

const ThemeIcon = () => {
  const schemes: Record<string, string> = {
    dark: lightTheme?.palettes.navy[900],
    light: lightTheme?.palettes.lightBlue[200],
  };
  const { colorScheme } = usePreferencesContext();

  if (colorScheme === 'system') {
    return <Icon icon={faCircleHalfStroke} size={30} />;
  }

  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: schemes[colorScheme],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

const VisualizationListItem = () => {
  const { t } = useTranslation();
  const { colorScheme, updatePreference } = usePreferencesContext();
  const settingsColorScheme = useColorScheme();

  const colorSchema = {
    dark: lightTheme?.palettes.navy[900],
    light: lightTheme?.palettes.lightBlue[200],
  };

  const themeColors = [
    {
      colorSchema: 'dark',
      id: 'dark',
      title: 'theme.dark',
      color: colorSchema.dark,
      state: 'dark' === colorScheme,
      image: Platform.select({ ios: 'circle.fill', android: 'circle' }),
    },
    {
      colorSchema: 'light',
      id: 'light',
      title: 'theme.light',
      color: colorSchema.light,
      state: 'dark' === colorScheme,
      image: Platform.select({ ios: 'circle.fill', android: 'circle' }),
    },
    {
      colorSchema: 'light',
      id: 'system',
      title: 'theme.system',
      color:
        colorScheme === 'dark' ||
        (colorScheme === 'system' && settingsColorScheme === 'dark')
          ? 'white'
          : colorSchema.dark,
      state: colorScheme === 'system',
      image: Platform.select({
        ios: 'circle.lefthalf.fill',
        android: 'circle_half',
      }),
    },
  ];

  const themeLabel = (cc: string) => {
    return cc === 'system'
      ? `${t(`theme.${cc}`)} (${t(`theme.${settingsColorScheme}`)})`
      : t(`theme.${cc}`);
  };

  return (
    <MenuView
      actions={themeColors.map(cc => {
        return {
          id: cc.id,
          title: themeLabel(cc.id),
          image: cc.image,
          imageColor: cc.color,
          state: cc.id === colorScheme ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        updatePreference('colorScheme', event);
      }}
    >
      <ListItem
        title={themeLabel(colorScheme)}
        isAction
        accessibilityLabel={`${t('common.theme')}: ${themeLabel(
          colorScheme,
        )}. ${t('settingsScreen.openThemeMenu')}`}
        leadingItem={<ThemeIcon />}
      />
    </MenuView>
  );
};

const LanguageListItem = () => {
  const { t } = useTranslation();
  const { language, updatePreference } = usePreferencesContext();
  const deviceLanguage = useDeviceLanguage();

  const languageLabel = (cc: string) => {
    return cc === 'system'
      ? `${t(`common.${cc}`)} (${t(`common.${deviceLanguage}`)})`
      : t(`common.${cc}`);
  };

  return (
    <MenuView
      actions={['it', 'en', 'system'].map(cc => {
        return {
          id: cc,
          title: languageLabel(cc),
          state: cc === language ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        const lang = event as 'it' | 'en' | 'system';
        updatePreference('language', lang);

        const uiLanguage = lang === 'system' ? deviceLanguage : lang;
        i18next
          .changeLanguage(uiLanguage)
          .then(() => (Settings.defaultLocale = uiLanguage));
      }}
    >
      <ListItem
        isAction
        title={languageLabel(language)}
        accessibilityLabel={`${t('common.language')}: ${languageLabel(
          language,
        )}. ${t('settingsScreen.openLanguageMenu')}`}
      />
    </MenuView>
  );
};

const Notifications = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const { notifications, updatePreference } = usePreferencesContext();

  const onChangeNotification =
    (notificationType: string) => (value: boolean) => {
      updatePreference('notifications', {
        ...notifications,
        [notificationType]: value,
      });
    };

  return (
    <OverviewList indented>
      <SwitchListItem
        disabled
        accessible={true}
        accessibilityLabel={`${t('notifications.important')}. ${t(
          `common.activeStatus.${notifications?.important}`,
        )} `}
        accessibilityRole="switch"
        title={t('notifications.important')}
        value={notifications?.important}
        onChange={onChangeNotification('important')}
        leadingItem={
          <Icon icon={faCircleExclamation} size={fontSizes['2xl']} />
        }
      />
      <SwitchListItem
        disabled
        accessible={true}
        accessibilityLabel={`${t('notifications.events')}. ${t(
          `common.activeStatus.${notifications?.events}`,
        )} `}
        accessibilityRole="switch"
        title={t('notifications.events')}
        value={notifications?.events}
        onChange={onChangeNotification('events')}
        leadingItem={<Icon icon={faCalendarDay} size={fontSizes['2xl']} />}
      />
      <SwitchListItem
        disabled
        accessible={true}
        accessibilityLabel={`${t('notifications.presence')}. ${t(
          `common.activeStatus.${notifications?.presence}`,
        )} `}
        accessibilityRole="switch"
        title={t('notifications.reservationPresence')}
        value={notifications?.presence}
        onChange={onChangeNotification('presence')}
        leadingItem={<Icon icon={faCalendarCheck} size={fontSizes['2xl']} />}
      />
    </OverviewList>
  );
};

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <View style={styles.container}>
          <Section>
            <SectionHeader title={t('common.theme')} />
            <OverviewList indented>
              <VisualizationListItem />
            </OverviewList>
          </Section>
          <Section>
            <SectionHeader title={t('common.language')} />
            <OverviewList indented>
              <LanguageListItem />
            </OverviewList>
          </Section>
          <Section>
            <SectionHeader
              title={t('common.notifications')}
              trailingItem={<Badge text={t('common.comingSoon')} />}
            />
            <Notifications />
          </Section>
          <Section>
            <SectionHeader title={t('common.cache')} />
            <OverviewList indented>
              <CleanCacheListItem />
            </OverviewList>
          </Section>
        </View>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
  });
