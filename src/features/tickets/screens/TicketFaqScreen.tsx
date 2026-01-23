import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { HtmlView } from '../../../core/components/HtmlView';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaq'>;

export const TicketFaqScreen = ({ route, navigation }: Props) => {
  const { faq } = route.params;
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
    >
      <SafeAreaView>
        <Section>
          <SectionHeader title={faq.question} ellipsizeTitle={false} />
          <HtmlView
            props={{ source: { html: faq.answer } }}
            variant="longProse"
          />
        </Section>

        <CtaButton
          absolute={false}
          tkey="ticketFaqsScreen.writeTicket"
          hint={t('ticketFaqsScreen.noResultFound')}
          action={() =>
            navigation.navigate('CreateTicket', {
              subtopicId: undefined,
              topicId: undefined,
            })
          }
          icon={faPencil}
        />

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
