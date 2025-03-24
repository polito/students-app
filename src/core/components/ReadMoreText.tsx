import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, TextLayoutLine, TextStyle } from 'react-native';

import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { Theme } from '@lib/ui/types/Theme.ts';

import { IS_ANDROID, IS_IOS } from '../constants.ts';
import { usePreferencesContext } from '../contexts/PreferencesContext.ts';

export type ReadMoreTextProps = {
  message: string;
  styleText?: StyleProp<TextStyle>;
  styleReadMore?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

const DEFAULT_NUMBER_OF_LINES = 3;
export const ReadMoreText = ({
  message,
  styleText,
  styleReadMore,
  numberOfLines = DEFAULT_NUMBER_OF_LINES,
}: ReadMoreTextProps) => {
  const { language } = usePreferencesContext();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const [text, setText] = useState({
    length: 0,
    isTruncatedText: false,
  });
  const [readMore, setReadMore] = useState<boolean>(false);

  const space = useMemo(() => {
    return language === 'it' ? 15 : 20;
  }, [language]);

  const handleReadMoreText = (textLayoutLines: TextLayoutLine[]) => {
    let textLength = 0;
    if (textLayoutLines.length > numberOfLines) {
      for (let line = 0; line < numberOfLines; line++) {
        textLength += textLayoutLines[line].text.length;
      }
      setText({ length: textLength, isTruncatedText: true });
      return;
    }
  };

  return (
    <>
      {IS_IOS && (
        <Text
          style={{ height: 0 }}
          onTextLayout={({ nativeEvent: { lines } }) => {
            if (text.length > 0) {
              return;
            }
            if (IS_IOS) {
              handleReadMoreText(lines);
            }
          }}
        >
          {message}
        </Text>
      )}
      <Text
        style={[styles.message, styleText]}
        numberOfLines={text.length === 0 ? numberOfLines : 0}
        onTextLayout={({ nativeEvent: { lines } }) => {
          if (text.length > 0) {
            return;
          }
          if (IS_ANDROID) handleReadMoreText(lines);
        }}
      >
        {text.isTruncatedText && !readMore && text.length !== 0
          ? `${message.slice(0, text.length - space).trim()}...`
          : message}
        <Text
          style={[styles.readMore, styleReadMore]}
          onPress={() => {
            setReadMore(!readMore);
          }}
        >
          {' '}
          {readMore
            ? t('provisionalGradeScreen.teacherMessage.readLess')
            : t('provisionalGradeScreen.teacherMessage.readMore')}
        </Text>
      </Text>
    </>
  );
};

const createStyles = ({ colors, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    message: {
      marginHorizontal: spacing[4],
      marginVertical: spacing[3],
      fontSize: fontSizes.sm,
    },
    readMore: {
      fontSize: fontSizes.sm,
      color: colors.readMore,
    },
  });
