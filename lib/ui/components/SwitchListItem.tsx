import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Switch } from '@lib/ui/components/Switch';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

interface Props extends ListItemProps {
  title: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export const SwitchListItem = ({
  title,
  value,
  onChange,
  disabled,
  ...rest
}: Props) => {
  const { fontSizes } = useTheme();

  return (
    <ListItem
      title={
        <Text
          accessible={false}
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
          value={value ?? false}
          disabled={disabled}
          onChange={() => {
            onChange?.(!value);
          }}
        />
      }
      {...rest}
    />
  );
};
