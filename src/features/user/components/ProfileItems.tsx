import React from 'react';
import { useTranslation } from 'react-i18next';

import { faBell, faCog } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const ProfileNotificationItem = () => {
  const { colors, fontSizes } = useTheme();
  const { t } = useTranslation();
  return (
    <ListItem
      title={t('messagesScreen.title')}
      linkTo={'Notifications'}
      leadingItem={
        <Icon icon={faBell} color={colors.text[500]} size={fontSizes.xl} />
      }
    />
  );
};

export const ProfileSettingItem = () => {
  const { colors, fontSizes } = useTheme();
  const { t } = useTranslation();
  return (
    <ListItem
      title={t('profileScreen.settings')}
      leadingItem={
        <Icon icon={faCog} color={colors.text[500]} size={fontSizes.xl} />
      }
      linkTo={'Settings'}
    />
  );
};
