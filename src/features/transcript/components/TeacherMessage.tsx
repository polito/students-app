import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { Theme } from '@lib/ui/types/Theme.ts';

import { ReadMoreText } from '../../../core/components/ReadMoreText.tsx';

export type Props = {
  message: string;
};

export const TeacherMessage = ({ message }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <View>
      <Text variant="title" role="heading" style={styles.title}>
        {t('provisionalGradeScreen.teacherMessage.title')}
      </Text>
      <Card>
        <ReadMoreText message={message} />
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
