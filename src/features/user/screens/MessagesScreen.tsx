import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetMessages } from '../../../core/queries/studentHooks';
import { MessageListItem } from '../components/MessageListItem';

export const MessagesScreen = () => {
  const { spacing } = useTheme();
  const messagesQuery = useGetMessages();

  const { isLoading, data: messages } = messagesQuery;
  const { t } = useTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[messagesQuery]} manual />}
    >
      <SafeAreaView>
        <Section style={{ marginTop: spacing['2'] }}>
          <OverviewList
            loading={isLoading}
            emptyStateText={t('messagesScreen.empty')}
          >
            {messages?.map((message, index) => (
              <MessageListItem
                messageItem={message}
                key={message.id}
                index={index}
                totalData={messages.length}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
