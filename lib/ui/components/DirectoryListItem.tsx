import { StyleSheet, TouchableHighlightProps } from 'react-native';

import { faFolder } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  trailingItem?: JSX.Element;
}

export const DirectoryListItem = (props: TouchableHighlightProps & Props) => {
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <FontAwesomeIcon
          icon={faFolder}
          size={24}
          style={[styles.icon, styles.folderIcon as any]}
        />
      }
      {...props}
    />
  );
};

const createItemStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    icon: {
      color: colors.heading,
      marginRight: spacing[3],
    },
    folderIcon: {
      color: colors.secondary[600],
    },
  });
