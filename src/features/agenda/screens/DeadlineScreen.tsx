import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { EventDetails } from '../../../core/components/EventDetails';
import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Deadline'>;

export const DeadlineScreen = ({ route }: Props) => {
  const { item: deadline } = route.params;
  const { t } = useTranslation();
  const { palettes, spacing } = useTheme();
  const openInAppLink = useOpenInAppLink();

  const onPressDeadlineUrl = () =>
    deadline.url ? openInAppLink(deadline.url) : null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <EventDetails
          title={deadline?.title}
          type={t('common.deadline')}
          time={convertMachineDateToFormatDate(deadline?.date)}
        />
        {/* TODO show link only when relevant */}
        {deadline?.url && (
          <OverviewList>
            <ListItem
              leadingItem={
                <Icon
                  icon={faLink}
                  size={20}
                  color={palettes.primary[400]}
                  style={{ marginRight: spacing[2] }}
                />
              }
              title={deadline?.type}
              subtitle={deadline?.title}
              onPress={onPressDeadlineUrl}
            />
          </OverviewList>
        )}
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
