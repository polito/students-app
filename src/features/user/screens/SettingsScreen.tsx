import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { unlink } from 'react-native-fs';

import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faBroom,
  faCalendarDay,
  faCircleExclamation,
  faCircleHalfStroke,
  faFolderOpen,
  faFont,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Col } from '@lib/ui/components/Col';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { useCheckMfa } from '~/core/queries/authHooks';
import { hasPrivateKeyMFA, resetPrivateKeyMFA } from '~/utils/keychain';

import i18next from 'i18next';
import { Settings } from 'luxon';

import { version } from '../../../../package.json';
import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import {
  PreferencesContextBase,
  usePreferencesContext,
} from '../../../core/contexts/PreferencesContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { removeFileSafAware } from '../../../core/providers/downloads/safMirror';
import { pickSafDirectory } from '../../../core/providers/downloads/safStorage';
import { useUpdateDevicePreferences } from '../../../core/queries/studentHooks';
import { lightTheme } from '../../../core/themes/light';
import { formatFileSize } from '../../../utils/files';
import { useCoursesFilesCachePath } from '../../courses/hooks/useCourseFilesCachePath';

const CleanCacheListItem = () => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const { fontSizes } = useTheme();
  const filesCache = useCoursesFilesCachePath();
  const [cacheSize, setCacheSize] = useState<number>();
  const confirm = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('settingsScreen.cleanCacheConfirmMessage'),
  });
  const fileDatabaseRef = useRef(getFileDatabase());

  const refreshSize = () => {
    fileDatabaseRef.current
      .getTotalSize()
      .then(size => {
        setCacheSize(size);
      })
      .catch(() => {
        setCacheSize(0);
      });
  };

  useEffect(() => {
    refreshSize();
  }, []);
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
          const allFiles = await fileDatabaseRef.current.getAllFiles();
          await Promise.all(
            allFiles.map(f => removeFileSafAware(f.path).catch(() => {})),
          );
          await fileDatabaseRef.current.deleteAllFiles();
          unlink(filesCache).catch(() => {});
          setFeedback({
            text: t('coursePreferencesScreen.cleanCacheFeedback'),
          });
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
      state: colorScheme === 'dark',
      image: Platform.select({ ios: 'circle.fill', android: 'circle' }),
    },
    {
      colorSchema: 'light',
      id: 'light',
      title: 'theme.light',
      color: colorSchema.light,
      state: colorScheme === 'dark',
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

  return (
    <StatefulMenuView
      actions={themeColors.map(cc => {
        return {
          id: cc.id,
          title: t(`theme.${cc.id}`),
          image: cc.image,
          imageColor: cc.color,
          state: cc.id === colorScheme ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        updatePreference(
          'colorScheme',
          event as PreferencesContextBase['colorScheme'],
        );
      }}
    >
      <ListItem
        title={t(`theme.${colorScheme}`)}
        isAction
        accessibilityLabel={`${t('common.theme')}: ${t(
          `theme.${colorScheme}`,
        )}. ${t('settingsScreen.openThemeMenu')}`}
        leadingItem={<ThemeIcon />}
      />
    </StatefulMenuView>
  );
};

const LanguageListItem = () => {
  const { t } = useTranslation();
  const { language, updatePreference } = usePreferencesContext();
  const { mutate } = useUpdateDevicePreferences();
  const isDisabled = useOfflineDisabled();

  const choices = useMemo(() => {
    if (isDisabled) return [];

    return ['it', 'en'] as const;
  }, [isDisabled]);
  return (
    <StatefulMenuView
      actions={choices.map(cc => {
        return {
          id: cc,
          title: t(`common.${cc}`),
          state: cc === language ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        const lang = event as 'it' | 'en';

        mutate({ updatePreferencesRequest: { language: lang } });
        updatePreference('language', lang);

        i18next
          .changeLanguage(lang)
          .then(() => (Settings.defaultLocale = lang));
      }}
    >
      <ListItem
        isAction
        disabled={isDisabled}
        title={t(`common.${language}`)}
        accessibilityLabel={`${t('common.language')}: ${t(
          `common.${language}`,
        )}. ${t('settingsScreen.openLanguageMenu')}`}
      />
    </StatefulMenuView>
  );
};

// TODO: temporarily removed
// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
const Notifications = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const { notifications, updatePreference } = usePreferencesContext();

  const onChangeNotification =
    (notificationType: string) => (value: boolean) => {
      updatePreference('notifications', {
        ...notifications,
        [notificationType]: value,
      } as PreferencesContextBase['notifications']);
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

const StorageLocationListItem = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const {
    fileStorageLocation,
    customStoragePath,
    customStorageDisplayPath,
    updatePreference,
  } = usePreferencesContext();
  const { setFeedback } = useFeedbackContext();
  const [isMoving, setIsMoving] = useState(false);
  const currentLocation =
    fileStorageLocation === 'custom' ? 'custom' : 'internal';
  const confirmStorageChange = useConfirmationDialog({
    title: t('settingsScreen.storageChangeConfirmTitle'),
    message: t('settingsScreen.storageChangeConfirmMessage'),
  });

  const choices = useMemo(
    () => [
      { id: 'internal', title: t('settingsScreen.storageInternal') },
      { id: 'custom', title: t('settingsScreen.storageCustom') },
    ],
    [t],
  );

  const handlePickDirectory = useCallback(async () => {
    if (!(await confirmStorageChange())) return;
    try {
      const result = await pickSafDirectory();

      setIsMoving(true);
      setFeedback({ text: t('settingsScreen.storageChanging') });

      try {
        const fileDatabase = getFileDatabase();
        const allFiles = await fileDatabase.getAllFiles();
        await Promise.all(
          allFiles.map(f => removeFileSafAware(f.path).catch(() => {})),
        );
        await fileDatabase.deleteAllFiles();
      } catch (deleteError) {
        console.error('Error removing files before switch:', deleteError);
      }

      updatePreference('customStoragePath', result.uri);
      updatePreference('customStorageDisplayPath', result.displayPath);
      updatePreference('fileStorageLocation', 'custom');
      setFeedback({ text: t('settingsScreen.storageCustomSet') });
    } catch (error: any) {
      if (error?.code !== 'CANCELLED') {
        console.error('Error picking directory:', error);
        setFeedback({ text: t('common.error'), isError: true });
      }
    } finally {
      setIsMoving(false);
    }
  }, [confirmStorageChange, updatePreference, setFeedback, t]);

  const handleSwitchToInternal = useCallback(async () => {
    if (!customStoragePath) {
      updatePreference('fileStorageLocation', 'internal');
      return;
    }
    if (!(await confirmStorageChange())) return;

    setIsMoving(true);
    setFeedback({ text: t('settingsScreen.storageChanging') });

    try {
      const fileDatabase = getFileDatabase();
      const allFiles = await fileDatabase.getAllFiles();
      await Promise.all(
        allFiles.map(f => removeFileSafAware(f.path).catch(() => {})),
      );
      await fileDatabase.deleteAllFiles();
    } catch (deleteError) {
      console.error('Error removing files before switch:', deleteError);
    } finally {
      setIsMoving(false);
    }

    updatePreference('fileStorageLocation', 'internal');
    setFeedback({ text: t('settingsScreen.storageInternalSet') });
  }, [
    customStoragePath,
    confirmStorageChange,
    updatePreference,
    setFeedback,
    t,
  ]);

  const handleChange = useCallback(
    async (newLocation: string) => {
      if (newLocation === currentLocation || isMoving) return;
      if (newLocation === 'custom') {
        await handlePickDirectory();
      } else {
        await handleSwitchToInternal();
      }
    },
    [currentLocation, isMoving, handlePickDirectory, handleSwitchToInternal],
  );

  const subtitle = useMemo(() => {
    if (currentLocation === 'custom' && customStorageDisplayPath) {
      return customStorageDisplayPath;
    }
    return currentLocation === 'custom'
      ? t('settingsScreen.storageCustomDescription')
      : t('settingsScreen.storageInternalDescription');
  }, [currentLocation, customStorageDisplayPath, t]);

  return (
    <StatefulMenuView
      actions={choices.map(c => ({
        id: c.id,
        title: c.title,
        state: c.id === currentLocation ? 'on' : undefined,
      }))}
      onPressAction={({ nativeEvent: { event } }) => {
        handleChange(event);
      }}
    >
      <ListItem
        isAction
        disabled={isMoving}
        title={
          currentLocation === 'custom'
            ? t('settingsScreen.storageCustom')
            : t('settingsScreen.storageInternal')
        }
        subtitle={subtitle}
        leadingItem={<Icon icon={faFolderOpen} size={fontSizes['2xl']} />}
      />
    </StatefulMenuView>
  );
};

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { data: mfaStatus } = useCheckMfa(true);
  const { palettes } = useTheme();

  const [localMfaKey, setLocalMfaKey] = useState<boolean>(false);
  useEffect(() => {
    hasPrivateKeyMFA().then(res => setLocalMfaKey(res));
  }, [mfaStatus]);

  const handleKeyRemoval = useCallback(async () => {
    try {
      await resetPrivateKeyMFA();
      setLocalMfaKey(false);
      Alert.alert(
        t('mfaScreen.settings.removedTitle'),
        t('mfaScreen.settings.removed'),
        [{ text: t('common.ok') }],
      );
    } catch (error) {
      console.error('Error removing MFA key:', error);
    }
  }, [t]);

  const handleBadgeStatus = () => {
    if (mfaStatus?.status === 'active' && localMfaKey) {
      return (
        <Badge
          backgroundColor={palettes.success[500]}
          foregroundColor={palettes.text[100]}
          text={t('mfaScreen.settings.active')}
        />
      );
    }
    if (mfaStatus?.status === 'locked') {
      return (
        <Badge
          backgroundColor={palettes.warning[500]}
          foregroundColor={palettes.warning[100]}
          text={t('mfaScreen.settings.locked')}
        />
      );
    }
    if (
      mfaStatus?.status === 'available' ||
      mfaStatus?.status === 'needsReauth'
    ) {
      return (
        <Badge
          backgroundColor={palettes.warning[400]}
          foregroundColor={palettes.text[100]}
          text={t('mfaScreen.settings.disabled')}
        />
      );
    }
    return (
      <Badge
        backgroundColor={palettes.error[500]}
        foregroundColor={palettes.error[100]}
        text={t('common.error')}
      />
    );
  };

  useEffect(() => {
    if (
      (mfaStatus?.status === 'available' ||
        mfaStatus?.status === 'needsReauth') &&
      localMfaKey
    ) {
      handleKeyRemoval();
    }
  }, [mfaStatus?.status, localMfaKey, handleKeyRemoval]);

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
          {/* <Section>
              <SectionHeader
                title={t('common.notifications')}
                trailingItem={<Badge text={t('common.comingSoon')} />}
              />
              <Notifications />
            </Section>*/}
          {mfaStatus?.status !== 'unavailable' && (
            <Section>
              <SectionHeader title={t('settingsScreen.securityTitle')} />
              <OverviewList indented>
                <ListItem
                  title={t('settingsScreen.authenticatorTitle')}
                  accessibilityRole="button"
                  linkTo={{
                    screen: 'MfaSettings',
                  }}
                  leadingItem={<Icon icon={faShieldHalved} size={20} />}
                  trailingItem={
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {handleBadgeStatus()}
                      {Platform.OS === 'ios' && <DisclosureIndicator />}
                    </View>
                  }
                />
              </OverviewList>
            </Section>
          )}
          <Section>
            <SectionHeader title={t('common.accessibility')} />
            <OverviewList indented>
              <ListItem
                isAction
                title={t('accessibilitySettingsScreen.fontSettingsTitle')}
                accessibilityRole="button"
                linkTo={{ screen: 'AccessibilitySettings' }}
                leadingItem={<Icon icon={faFont} size={20} />}
              />
            </OverviewList>
          </Section>
          {Platform.OS === 'android' && (
            <Section>
              <SectionHeader title={t('settingsScreen.storageTitle')} />
              <OverviewList indented>
                <StorageLocationListItem />
              </OverviewList>
            </Section>
          )}
          <Section>
            <SectionHeader title={t('common.cache')} />
            <OverviewList indented>
              <CleanCacheListItem />
            </OverviewList>
          </Section>
          <Col ph={4}>
            <Text>{t('settingsScreen.appVersion', { version })}</Text>
          </Col>
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
