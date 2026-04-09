import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { GuideField } from '@polito/student-api-client';
import Clipboard from '@react-native-clipboard/clipboard';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';

type Props = {
  field: GuideField;
};
export const GuideFieldListItem = ({ field }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { setFeedback } = useFeedbackContext();
  const handleCopy = () => {
    if (!field.isCopyEnabled) return;
    Clipboard.setString(field.value);
    setFeedback({
      text: t('guideScreen.copiedFieldFeedback', { field: field.label }),
    });
  };

  return (
    <ListItem
      accessible={true}
      accessibilityRole={field.isCopyEnabled ? 'button' : 'text'}
      accessibilityLabel={[field.label, ' - ', field.value].join('')}
      accessibilityHint={
        field.isCopyEnabled ? t('guideFieldListItem.tapToCopy') : undefined
      }
      onPress={field.isCopyEnabled ? handleCopy : undefined}
      title={
        <View style={styles.row}>
          <Text style={[styles.text, styles.label]}>{field.label}</Text>
          <Text weight="semibold" style={styles.text}>
            {field.value}
          </Text>
        </View>
      }
    />
  );
};

const createStyles = ({ fontSizes, spacing }: Theme) =>
  StyleSheet.create({
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[2],
    },
    text: {
      fontSize: fontSizes.md,
    },
    label: {
      flexShrink: 1,
    },
  });
