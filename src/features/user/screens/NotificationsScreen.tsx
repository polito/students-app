import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, SafeAreaView, ScrollView } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import {
  faBullhorn,
  faComments,
  faPersonCirclePlus,
  faVideoCamera,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { IS_ANDROID } from '../../../core/constants';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreference,
} from '../../../core/queries/studentHooks';

export const NotificationsScreen = () => {
  const { t } = useTranslation();

  const query = useGetNotificationPreferences();
  const { mutate: updatePreference } = useUpdateNotificationPreference();
  const { data, isLoading } = query;

  const { fontSizes } = useTheme();
  const isOffline = useOfflineDisabled();

  const showIosSuccessMessage = (type = false) => {
    if (IS_ANDROID) {
      return;
    }
    const message = !type ? t('common.activated') : t('common.deactivated');
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, 200);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[query]} manual />}
    >
      <SafeAreaView>
        <Col pv={2}>
          <Section>
            <SectionHeader
              title={t('notificationsScreen.globalTitle')}
              subtitle={t('notificationsScreen.globalSubtitle')}
            />
            <OverviewList indented loading={isLoading}>
              <SwitchListItem
                accessibilityLabel={[
                  t('common.ticket_plural'),
                  data?.tickets ? t('common.enabled') : t('common.disabled'),
                  data?.tickets
                    ? t('common.click2Deactivate')
                    : t('common.click2Active'),
                ].join(', ')}
                leadingItem={<Icon icon={faComments} size={fontSizes['2xl']} />}
                title={t('common.ticket_plural')}
                disabled={isOffline}
                value={data?.tickets}
                onChange={() => {
                  updatePreference({
                    notificationType: 'tickets',
                    targetValue: !data?.tickets,
                  });
                  showIosSuccessMessage(data?.tickets);
                }}
              />
              <SwitchListItem
                accessible
                accessibilityLabel={[
                  t('common.booking_plural'),
                  data?.bookings ? t('common.enabled') : t('common.disabled'),
                  data?.bookings
                    ? t('common.click2Deactivate')
                    : t('common.click2Active'),
                ].join(', ')}
                leadingItem={
                  <Icon icon={faPersonCirclePlus} size={fontSizes['2xl']} />
                }
                title={t('common.booking_plural')}
                disabled={isOffline}
                value={data?.bookings}
                onChange={() => {
                  updatePreference({
                    notificationType: 'bookings',
                    targetValue: !data?.bookings,
                  });
                  showIosSuccessMessage(data?.bookings);
                }}
              />
            </OverviewList>
          </Section>
          <Section>
            <SectionHeader
              title={t('notificationsScreen.perCourseTitle')}
              trailingItem={<UnreadBadge text={t('common.comingSoon')} />}
            />
            <OverviewList indented loading={isLoading}>
              <SwitchListItem
                accessible
                accessibilityLabel={[
                  t('common.notice_plural'),
                  t('coursePreferencesScreen.noticesSubtitle'),
                  t('common.enabled'),
                  t('common.comingSoon'),
                ].join(', ')}
                title={t('common.notice_plural')}
                subtitle={t('coursePreferencesScreen.noticesSubtitle')}
                disabled={true}
                value={true}
                leadingItem={<Icon icon={faBullhorn} size={fontSizes['2xl']} />}
                onChange={() => {
                  /* updatePreference({
                    notificationType: 'notices',
                    targetValue: !data?.notices,
                  });*/
                }}
              />
              <SwitchListItem
                accessible
                accessibilityLabel={[
                  t('common.file_plural'),
                  t('coursePreferencesScreen.filesSubtitle'),
                  t('common.enabled'),
                  t('common.comingSoon'),
                ].join(', ')}
                title={t('common.file_plural')}
                subtitle={t('coursePreferencesScreen.filesSubtitle')}
                disabled={true}
                value={true}
                leadingItem={<Icon icon={faFile} size={fontSizes['2xl']} />}
                onChange={() => {
                  /* updatePreference({
                    notificationType: 'files',
                    targetValue: !data?.files,
                  });*/
                }}
              />
              <SwitchListItem
                accessible
                accessibilityLabel={[
                  t('common.lecture_plural'),
                  t('coursePreferencesScreen.lecturesSubtitle'),
                  t('common.enabled'),
                  t('common.comingSoon'),
                ].join(', ')}
                title={t('common.lecture_plural')}
                subtitle={t('coursePreferencesScreen.lecturesSubtitle')}
                disabled={true}
                value={true}
                leadingItem={
                  <Icon icon={faVideoCamera} size={fontSizes['2xl']} />
                }
                onChange={() => {
                  /* updatePreference({
                    notificationType: 'lectures',
                    targetValue: !data?.lectures,
                  });*/
                }}
              />
            </OverviewList>
          </Section>
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
