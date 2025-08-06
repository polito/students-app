import { StyleSheet, View } from 'react-native';

import { ModalContent } from '@lib/ui/components/ModalContent.tsx';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export const CourseStatisticsModalContent = ({
  title,
  content,
  itemList,
  onDismiss,
}: {
  title: string;
  content: string;
  itemList: { title: string; content: string }[];
  onDismiss: () => void;
}) => {
  const styles = useStylesheet(createStyles);
  return (
    <ModalContent close={onDismiss} title={title}>
      <View style={styles.container}>
        <View style={styles.content} accessible>
          <Text accessibilityLabel={content}>{content}</Text>
          {itemList.map((item, index) => {
            return (
              <View style={styles.listItem} key={index}>
                <Text>{`\u2022`} </Text>
                <View style={styles.listItem}>
                  <Text>
                    <Text
                      style={styles.listItemTitle}
                      accessibilityLabel={item.title}
                    >{`${item.title}:`}</Text>{' '}
                    <Text accessibilityLabel={item.content}>
                      {item.content}
                    </Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ModalContent>
  );
};

const createStyles = ({ dark, fontSizes, colors, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingBottom: spacing[4],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: dark ? colors.surfaceDark : colors.background,
      paddingVertical: spacing[2],
    },
    headerTitle: {
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: fontSizes.lg,
      textAlign: 'center',
    },
    content: {
      padding: spacing[4],
      gap: spacing[4],
    },
    listItem: {
      flexDirection: 'row',
    },
    listItemTitle: {
      fontWeight: 'bold',
    },
  });
