import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetGuides } from '../../../core/queries/studentHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Guides'>;

export const GuidesScreen = (_props: Props) => {
  const guidesQuery = useGetGuides();
  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();

  const { emailGuideRead } = usePreferencesContext();

  const isUnread = (guideId: string) => {
    if (guideId !== 'email') return;

    if (emailGuideRead) return false;
    return true;
  };

  useEffect(() => {
    if (!guidesQuery.isLoading && guidesQuery.data) {
      AccessibilityInfo.announceForAccessibility(
        t('guidesScreen.listLoaded', { count: guidesQuery.data.length }),
      );
    }
  }, [guidesQuery.isLoading, guidesQuery.data, t]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[guidesQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <View
            accessibilityRole="list"
            accessibilityLabel={t('guidesScreen.guidesList')}
          >
            <OverviewList
              emptyStateText={
                guidesQuery.data && guidesQuery.data.length === 0
                  ? t('common.cacheMiss')
                  : undefined
              }
              indented
              loading={guidesQuery.isLoading}
            >
              {guidesQuery.data?.map((guide, index) => (
                <ListItem
                  accessibilityRole="button"
                  key={guide.id}
                  title={guide.listTitle}
                  unread={isUnread(guide.id)}
                  accessible={true}
                  accessibilityLabel={[
                    accessibilityListLabel(index, guidesQuery.data.length),
                    ' - ',
                    guide.listTitle,
                    isUnread(guide.id)
                      ? `, ${t('guidesScreen.unreadGuide')}`
                      : '',
                  ].join('')}
                  accessibilityHint={t('guidesScreen.tapToOpenGuide')}
                  linkTo={{
                    screen: 'Guide',
                    params: { id: guide.id },
                  }}
                />
              ))}
            </OverviewList>
          </View>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
