import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  ViewStyle,
} from 'react-native';

import { faFile } from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  title: string | JSX.Element;
  subtitle?: string;
  sizeInKiloBytes?: number;
  trailingItem?: JSX.Element;
  isDownloaded: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FileListItem = ({
  isDownloaded,
  subtitle,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      isNavigationAction
      leadingItem={
        <Icon icon={faFile} size={fontSizes['2xl']} style={styles.fileIcon} />
      }
      subtitle={subtitle}
      {...rest}
    />
  );
};

const createItemStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    fileIcon: {
      color: colors.heading,
    },
    fileSize: {
      paddingLeft: spacing[1],
    },
    subtitle: {
      flexShrink: 1,
    },
  });
