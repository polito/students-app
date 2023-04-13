import { useTranslation } from 'react-i18next';
import { Linking, ScrollView } from 'react-native';

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Deadline'>;

export const DeadlineScreen = ({ route }: Props) => {
  const { item: deadline } = route.params;
  const { t } = useTranslation();
  const { palettes, spacing } = useTheme();

  const onPressDeadlineUrl = () =>
    deadline.url ? Linking.openURL(deadline.url) : null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <EventDetails
        title={deadline?.title}
        type={t('common.deadline')}
        time={convertMachineDateToFormatDate(deadline?.date)}
      />
      {/* TODO show link only when relevant */}
      {deadline?.url && (
        <SectionList>
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
        </SectionList>
      )}
    </ScrollView>
  );
};
