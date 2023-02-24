import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import RenderHTML, { Document } from 'react-native-render-html';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
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
  const theme = useTheme();
  const styles = createStyles(theme);
  const { colors, spacing, fontSizes } = theme;
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();

  const dom = parseDocument(
    faq.answer.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
  ) as Document;

  return (
    <ScrollView
      contentContainerStyle={[
        bottomBarAwareStyles,
        scrollViewStyles,
        styles.scrollViewStyle,
      ]}
    >
      <Section style={{ paddingVertical: spacing[2] }}>
        <SectionHeader title={faq.question} ellipsizeTitle={false} />
        <RenderHTML
          defaultTextProps={{
            selectable: true,
            selectionColor: colors.secondary[600],
          }}
          contentWidth={SCREEN_WIDTH}
          baseStyle={{
            paddingHorizontal: spacing[5],
            marginTop: spacing[10],
            color: colors.prose,
            fontFamily: 'Montserrat',
            fontSize: fontSizes.sm,
          }}
          source={{ dom }}
          systemFonts={['Montserrat']}
        />
      </Section>
      <CtaButton
        title={t('ticketFaqsScreen.writeTicket')}
        textExtra={t('ticketFaqsScreen.noResultFound')}
        action={() => navigation.navigate('TicketInsert')}
        icon={faPencil}
      />
    </ScrollView>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    noResultFound: {
      textAlign: 'center',
      color: colors.text['100'],
    },
    scrollViewStyle: {
      justifyContent: 'space-between',
      height: '100%',
    },
    action: {
      display: 'flex',
      backgroundColor: 'red',
      flexDirection: 'column',
      flex: 0,
    },
  });
