import { FontAwesomeIcon, Props } from '@fortawesome/react-native-fontawesome';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const Icon = (props: Props) => {
  const { colors } = useTheme();
  return <FontAwesomeIcon {...props} color={props.color ?? colors.heading} />;
};
