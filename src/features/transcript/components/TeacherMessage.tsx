import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextLayoutLine, View } from 'react-native';

import { Card } from '@lib/ui/components/Card.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { Theme } from '@lib/ui/types/Theme.ts';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext.ts';

export type Props = {
  message: string;
};

const DEFAULT_NUMBER_OF_LINES = 3;

export const TeacherMessage = ({ message }: Props) => {
  const styles = useStylesheet(createStyles);
  const { language } = usePreferencesContext();
  const { t } = useTranslation();
  const [text, setText] = useState({
    length: 0,
    isTruncatedText: false,
  });
  const [readMore, setReadMore] = useState<boolean>(false);

  const space = useMemo(() => {
    return language === 'it' ? 10 : 20;
  }, [language]);

  const handleReadMoreText = (textLayoutLines: TextLayoutLine[]) => {
    let textLength = 0;
    if (textLayoutLines.length > DEFAULT_NUMBER_OF_LINES) {
      for (let line = 0; line < DEFAULT_NUMBER_OF_LINES; line++) {
        textLength += textLayoutLines[line].text.length;
      }
      setText({ length: textLength, isTruncatedText: true });
      return;
    }
  };

  return (
    <View>
      <Text variant="title" role="heading" style={styles.title}>
        {t('provisionalGradeScreen.teacherMessage.title')}
      </Text>
      <Card>
        <Text
          style={styles.message}
          numberOfLines={text.length === 0 ? DEFAULT_NUMBER_OF_LINES : 0}
          onTextLayout={({ nativeEvent: { lines } }) => {
            handleReadMoreText(lines);
          }}
        >
          {text.isTruncatedText && !readMore && text.length !== 0
            ? `${message.slice(0, text.length - space).trim()}...`
            : message}
          <Text
            style={styles.readMore}
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
      </Card>
    </View>
  );
};

const createStyles = ({ colors, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      marginHorizontal: spacing[4],
      fontSize: fontSizes.md,
    },
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
