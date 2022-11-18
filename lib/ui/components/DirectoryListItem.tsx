import { TouchableHighlightProps } from 'react-native';

import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  trailingItem?: JSX.Element;
}

export const DirectoryListItem = (props: TouchableHighlightProps & Props) => {
  const { colors } = useTheme();

  return (
    <ListItem
      leadingItem={
        <Icon icon={faFolder} size={24} color={colors.secondary[500]} />
      }
      isNavigationAction
      {...props}
    />
  );
};
