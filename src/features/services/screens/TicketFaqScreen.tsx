import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import RenderHTML, { Document } from 'react-native-render-html';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { parseDocument } from 'htmlparser2';

import { SCREEN_WIDTH } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { ServiceStackParamList } from '../components/ServiceNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaq'>;

export const TicketFaqScreen = ({ route, navigation }: Props) => {
  const { faq } = route.params;
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors, spacing, fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();

  const dom = parseDocument(
    faq.answer.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
  ) as Document;

  return (
    <ScrollView
      contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
    >
      <Section style={styles.section}>
        <SectionHeader title={faq.question} ellipsizeTitle={false} />
        <View style={{ flex: 1 }}>
          <RenderHTML
            defaultTextProps={{
              selectable: true,
              selectionColor: colors.secondary[600],
            }}
            contentWidth={SCREEN_WIDTH}
            baseStyle={{
              paddingHorizontal: spacing[5],
              paddingBottom: spacing[5],
              marginTop: spacing[10],
              color: colors.prose,
              fontFamily: 'Montserrat',
              fontSize: fontSizes.sm,
            }}
            source={{ dom }}
            systemFonts={['Montserrat']}
          />
        </View>
      </Section>
      <CtaButton
        adjustInsets={true}
        title={t('ticketFaqsScreen.writeTicket')}
        textExtra={t('ticketFaqsScreen.noResultFound')}
        action={() =>
          navigation.navigate('TicketInsert', {
            subtopicId: undefined,
            topicId: undefined,
          })
        }
        icon={faPencil}
      />
    </ScrollView>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    noResultFound: {
      textAlign: 'center',
      color: colors.text['100'],
    },
    section: {
      paddingTop: spacing[2],
      paddingBottom: spacing[8],
    },
  });
