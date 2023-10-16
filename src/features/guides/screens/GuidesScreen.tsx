import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

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
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      accessibilityRole="list"
      accessibilityLabel={t('guidesScreen.total', {
        total: guidesQuery.data?.length ?? 0,
      })}
      refreshControl={<RefreshControl queries={[guidesQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
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
                key={guide.id}
                title={guide.listTitle}
                unread={isUnread(guide.id)}
                accessible={true}
                accessibilityLabel={accessibilityListLabel(
                  index,
                  guidesQuery.data.length,
                )}
                linkTo={{
                  screen: 'Guide',
                  params: { id: guide.id },
                }}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
