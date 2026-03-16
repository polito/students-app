import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { HtmlView } from './HtmlView';

interface Props {
  title: string;
  description?: string;
  html: string;
  width: number;
}

export const OnboardingStep = ({ title, html, width }: Props) => {
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();

  return (
    <View style={{ width }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="title" role="heading">
            {title}
          </Text>
        </View>
        <HtmlView
          props={{
            source: { html },
            baseStyle: {
              paddingHorizontal: spacing[5],
              paddingVertical: spacing[1],
            },
          }}
          variant="onboarding"
        />
      </ScrollView>
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    content: {
      paddingVertical: spacing[5],
    },
    header: {
      paddingHorizontal: spacing[5],
      gap: spacing[5],
    },
  });
