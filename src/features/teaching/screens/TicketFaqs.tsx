import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTicketTopics } from '../../../core/queries/ticketHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'TicketFaqs'>;

export const TicketFaqsScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketTopicsQuery = useGetTicketTopics();
  const refreshControl = useRefreshControl(ticketTopicsQuery);
  const ticketTopics = ticketTopicsQuery?.data?.data;
  const confirm = useConfirmationDialog();
  const routes = navigation.getState()?.routes;

  console.debug({ ticketTopics });

  useEffect(() => {
    // if (routes[routes.length - 2]?.name === 'Course') {
    //   navigation.setOptions({
    //     headerBackTitle: t('common.course'),
    //   });
    // }
  }, []);

  const action = async () => {
    // if (examAvailable) {
    //   return bookExam({});
    // }
    // if (await confirm()) {
    //   return cancelBooking();
    // }
    // return Promise.reject();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <Section>
          <SectionHeader title={t('ticketFaqsScreen.findFAQ')} />
          <View style={styles.card}>
            <Text style={styles.text}>
              {t('ticketFaqsScreen.findFAQSubtitle')}
            </Text>
          </View>
          {/* <Col flexStart> */}
          {/*   <Text> */}
          {/*     {t('ticketFaqsScreen.findFAQSubtitle')} */}
          {/*   </Text> */}
          {/* </Col> */}
        </Section>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    card: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    text: {
      marginLeft: 2,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  });
