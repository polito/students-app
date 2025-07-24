import { ReactElement } from 'react';
import { TouchableHighlightProps } from 'react-native';

import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props {
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  trailingItem?: ReactElement;
}

export const DirectoryListItem = (props: TouchableHighlightProps & Props) => {
  const { palettes } = useTheme();

  return (
    <ListItem
      leadingItem={
        <Icon icon={faFolder} size={24} color={palettes.secondary[500]} />
      }
      isAction
      {...props}
    />
  );
};
