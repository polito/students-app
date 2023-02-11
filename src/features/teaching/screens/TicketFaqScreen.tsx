import { ScrollView } from 'react-native';
import RenderHTML, { Document } from 'react-native-render-html';

import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { parseDocument } from 'htmlparser2';

import { SCREEN_WIDTH } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'TicketFaq'>;

export const TicketFaqScreen = ({ route }: Props) => {
  const { faq } = route.params;
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
    </ScrollView>
  );
};
