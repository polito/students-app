import { ScrollView, StyleSheet, View } from 'react-native';

import { ModalContent } from '@lib/ui/components/ModalContent';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export const CareerScreenModal = ({
  title,
  itemList,
  onDismiss,
}: {
  title: string;
  itemList: {
    title?: string;
    content: { description: string; formula?: string };
    dot: boolean;
  }[];
  onDismiss: () => void;
}) => {
  const styles = useStylesheet(createStyles);

  return (
    <ModalContent close={onDismiss} title={title}>
      <ScrollView style={styles.content} accessible>
        {itemList.map((item, index) => {
          if (item.content.description) {
            return (
              <View style={styles.listItem} key={index}>
                {item.dot && <Text>{`\u2022`} </Text>}
                <View style={styles.text}>
                  <Text>
                    {item.title && (
                      <Text
                        style={styles.listItemTitle}
                        accessibilityLabel={item.title}
                      >{`${item.title}: `}</Text>
                    )}
                    <Text accessibilityLabel={item.content.description}>
                      {item.content.description}
                    </Text>
                  </Text>
                  {item.content.formula && (
                    <View style={styles.formula}>
                      <Text italic={true}>{item.content.formula}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }
        })}
      </ScrollView>
    </ModalContent>
  );
};

const createStyles = ({ dark, fontSizes, colors, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
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
      padding: spacing[7],
      gap: spacing[4],
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: spacing['1'],
    },
    listItemTitle: {
      fontWeight: '600',
    },
    text: {
      flexDirection: 'column',
    },
    formula: {
      marginTop: spacing[1],
    },
  });
