import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { MessageTime } from '../../../src/features/services/components/MessageTime';

interface Props extends PropsWithChildren<ViewProps> {
  direction?: 'incoming' | 'outgoing';
  time?: Date;
  bubbleStyle?: ViewProps['style'];
}

export const ChatBubble = ({
  direction = 'outgoing',
  time,
  children,
  ...props
}: Props) => {
  const styles = useStylesheet(createStyles);

  return (
    <View {...props}>
      {time && <MessageTime time={time} right={direction === 'outgoing'} />}

      <View
        style={[
          styles.bubble,
          direction === 'incoming' ? styles.leftBubble : styles.rightBubble,
          props.bubbleStyle,
        ]}
      >
        {children}

        <View
          style={[
            styles.arrow,
            direction === 'incoming' ? styles.leftArrow : styles.rightArrow,
          ]}
        />
        <View
          style={[
            styles.arrowOverlap,
            direction === 'incoming'
              ? styles.leftArrowOverlap
              : styles.rightArrowOverlap,
          ]}
        />
      </View>
    </View>
  );
};

const createStyles = ({ colors, palettes, shapes, spacing }: Theme) =>
  StyleSheet.create({
    bubble: {
      padding: spacing[2.5],
      borderRadius: shapes.lg,
      width: '70%',
      marginTop: spacing[1],
    },
    rightBubble: {
      alignSelf: 'flex-end',
      backgroundColor: palettes.primary[600],
    },
    leftBubble: {
      alignSelf: 'flex-start',
      backgroundColor: palettes.primary[400],
    },
    arrow: {
      position: 'absolute',
      width: spacing[5],
      height: +spacing[6],
      bottom: 0,
    },
    leftArrow: {
      backgroundColor: palettes.primary[400],
      borderBottomRightRadius: +spacing[6],
      left: -spacing[2.5],
    },
    rightArrow: {
      backgroundColor: palettes.primary[600],
      borderBottomLeftRadius: +spacing[6],
      right: -spacing[2.5],
    },
    arrowOverlap: {
      position: 'absolute',
      backgroundColor: colors.background,
      width: spacing[5],
      height: 35,
      bottom: -spacing[2],
    },
    leftArrowOverlap: {
      borderBottomRightRadius: 18,
      left: -spacing[5],
    },
    rightArrowOverlap: {
      borderBottomLeftRadius: +spacing[5],
      right: -spacing[5],
    },
  });
