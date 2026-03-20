import { ComponentType, ReactNode, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { HtmlView } from './HtmlView';

interface Props {
  title: string;
  description?: string;
  html: string;
  cover?: string;
  ScrollViewComponent?: ComponentType<any>;
  children?: ReactNode;
}

export const OnboardingStep = ({
  title,
  html,
  cover,
  ScrollViewComponent = ScrollView,
  children,
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { shapes, spacing } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [coverAspectRatio, setCoverAspectRatio] = useState<number>();

  const coverWidth = screenWidth - spacing[5] * 2;

  useEffect(() => {
    if (cover) {
      Image.getSize(cover, (w, h) => {
        if (w > 0) setCoverAspectRatio(w / h);
      });
    }
  }, [cover]);

  return (
    <ScrollViewComponent
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {cover && coverAspectRatio && (
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: cover }}
            style={[
              styles.coverImage,
              {
                borderRadius: shapes.lg,
                width: coverWidth,
                aspectRatio: coverAspectRatio,
              },
            ]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
      )}
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
            paddingBottom: spacing[2],
          },
        }}
        variant="onboarding"
      />
      {children}
      <CtaButtonSpacer />
    </ScrollViewComponent>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    content: {
      paddingVertical: spacing[6],
    },
    header: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[2],
      gap: spacing[1],
    },
    coverImageContainer: {
      paddingHorizontal: spacing[5],
      marginBottom: spacing[2],
    },
    coverImage: {
      width: '100%',
    },
  });
