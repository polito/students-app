import { Switch } from 'react-native';

import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends ListItemProps {
  title: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export const SwitchListItem = ({ title, value, onChange, ...rest }: Props) => {
  const { fontSizes } = useTheme();

  return (
    <ListItem
      title={
        <Text
          variant="title"
          style={{
            fontSize: fontSizes.md,
          }}
          weight="normal"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      }
      onPress={() => {
        onChange?.(!value);
      }}
      trailingItem={
        <Switch
          value={value}
          accessibilityLabel={title}
          onChange={() => {
            onChange?.(!value);
          }}
        />
      }
      {...rest}
    />
  );
};
