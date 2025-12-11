import { ReactElement } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  trailingItem?: ReactElement;
  isDownloaded?: boolean;
  unread?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const DirectoryListItem = ({
  isDownloaded = false,
  unread = false,
  ...props
}: TouchableHighlightProps & Props) => {
  const { palettes } = useTheme();
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <View>
          <Icon icon={faFolder} size={24} color={palettes.secondary[500]} />
          {isDownloaded && (
            <View style={styles.downloadedIconContainer}>
              <Icon
                icon={faCheckCircle}
                size={12}
                color={palettes.success[600]}
              />
            </View>
          )}
        </View>
      }
      isAction
      unread={unread}
      {...props}
    />
  );
};

const createItemStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    downloadedIconContainer: {
      padding: 2,
      borderRadius: 16,
      backgroundColor: colors.background,
      position: 'absolute',
      top: -5,
      left: -8,
    },
  });
