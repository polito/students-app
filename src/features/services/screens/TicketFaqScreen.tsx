import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { Document } from 'react-native-render-html';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { parseDocument } from 'htmlparser2';

import { HtmlView } from '../../../core/components/HtmlView';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaq'>;

export const TicketFaqScreen = ({ route, navigation }: Props) => {
  const { faq } = route.params;
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const dom = parseDocument(
    faq.answer.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
  ) as Document;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
    >
      <Section>
        <SectionHeader title={faq.question} ellipsizeTitle={false} />
        <HtmlView source={{ dom }} />
      </Section>

      <CtaButton
        absolute={false}
        title={t('ticketFaqsScreen.writeTicket')}
        hint={t('ticketFaqsScreen.noResultFound')}
        action={() =>
          navigation.navigate('CreateTicket', {
            subtopicId: undefined,
            topicId: undefined,
          })
        }
        icon={faPencil}
      />
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
  });
