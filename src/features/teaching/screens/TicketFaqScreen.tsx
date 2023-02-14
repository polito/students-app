import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import RenderHTML, { Document } from 'react-native-render-html';

import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { parseDocument } from 'htmlparser2';

import { SCREEN_WIDTH } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { CreateTicketCta } from '../components/CreateTicketCta';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'TicketFaq'>;

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
      <Section style={{ marginTop: spacing[2] }}>
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
      <CreateTicketCta action={() => navigation.navigate('TicketFaqs')} />
    </ScrollView>
  );
};

const createStyles = ({
  spacing,
  colors,
  fontSizes,
  fontWeights,
  shapes,
}: Theme) =>
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
