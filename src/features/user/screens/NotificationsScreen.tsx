import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import {
  faBullhorn,
  faComments,
  faFile,
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
                leadingItem={<Icon icon={faComments} size={fontSizes['2xl']} />}
                title={t('common.ticket_plural')}
                disabled={isOffline}
                value={data?.tickets}
                onChange={() => {
                  updatePreference({
                    notificationType: 'tickets',
                    targetValue: !data?.tickets,
                  });
                }}
              />
              <SwitchListItem
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
