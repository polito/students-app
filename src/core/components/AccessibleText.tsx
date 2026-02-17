import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewProps } from 'react-native';

import { Props as LibTextProps, Text } from '@lib/ui/components/Text';

type SupportedLanguage = 'en' | 'it';

interface AccessibleTextProps extends Omit<LibTextProps, 'children'> {
  /**
   * The language of the text content. If different from the app's current
   * language, the screen reader will attempt to pronounce it in the correct language.
   */
  language?: SupportedLanguage;
  children: React.ReactNode;
}

/**
 * A Text component that supports specifying the language of the content.
 * This helps screen readers pronounce foreign words correctly.
 *
 * @example
 * ```tsx
 * // For English text when the app is in Italian
 * <AccessibleText language="en">Computer Science</AccessibleText>
 *
 * // For Italian text when the app is in English
 * <AccessibleText language="it">Ingegneria Informatica</AccessibleText>
 * ```
 */
export const AccessibleText = ({
  language,
  children,
  ...rest
}: AccessibleTextProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  // Only set accessibilityLanguage if it's different from current app language
  const accessibilityLanguage =
    language && language !== currentLanguage ? language : undefined;

  return (
    <Text {...rest} accessibilityLanguage={accessibilityLanguage}>
      {children}
    </Text>
  );
};

interface MultiLingualTextSegment {
  text: string;
  language?: SupportedLanguage;
}

interface MultiLingualTextProps extends ViewProps {
  /**
   * Array of text segments, each optionally with a language.
   */
  segments: MultiLingualTextSegment[];
  /**
   * Text variant to use for all segments.
   */
  variant?: LibTextProps['variant'];
}

/**
 * A component that renders multiple text segments, each potentially
 * in a different language. This helps screen readers pronounce
 * mixed-language content correctly.
 *
 * @example
 * ```tsx
 * <MultiLingualText
 *   segments={[
 *     { text: "Corso: ", language: "it" },
 *     { text: "Computer Science", language: "en" },
 *   ]}
 *   variant="prose"
 * />
 * ```
 */
export const MultiLingualText = ({
  segments,
  variant,
  ...rest
}: MultiLingualTextProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  return (
    <View accessible={true} {...rest}>
      {segments.map((segment, idx) => {
        const accessibilityLanguage =
          segment.language && segment.language !== currentLanguage
            ? segment.language
            : undefined;

        return (
          <Text
            key={`segment-${segment.language}-${idx}`}
            variant={variant}
            accessibilityLanguage={accessibilityLanguage}
          >
            {segment.text}
          </Text>
        );
      })}
    </View>
  );
};

/**
 * Hook to create accessibility props for foreign language content.
 */
export function useAccessibleLanguage() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  /**
   * Gets the accessibilityLanguage prop if the content language
   * is different from the current app language.
   *
   * @param contentLanguage - The language of the content
   * @returns accessibilityLanguage prop value or undefined
   */
  const getAccessibilityLanguage = (
    contentLanguage?: SupportedLanguage,
  ): string | undefined => {
    if (contentLanguage && contentLanguage !== currentLanguage) {
      return contentLanguage;
    }
    return undefined;
  };

  /**
   * Creates accessibility props for content in a specific language.
   *
   * @param contentLanguage - The language of the content
   * @returns Object with accessibilityLanguage prop if needed
   */
  const getLanguageAccessibilityProps = (
    contentLanguage?: SupportedLanguage,
  ) => {
    const accessibilityLanguage = getAccessibilityLanguage(contentLanguage);
    return accessibilityLanguage ? { accessibilityLanguage } : {};
  };

  return {
    currentLanguage,
    getAccessibilityLanguage,
    getLanguageAccessibilityProps,
  };
}
