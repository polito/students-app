import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IconButton, IconButtonProps } from '@lib/ui/components/IconButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { PlacesStackParamList } from './PlacesNavigator';

export interface SearchHeaderCtaProps extends Omit<IconButtonProps, 'icon'> {
  searchFilters?: PlacesStackParamList['PlacesSearch'];
}

export const SearchHeaderCta = ({
  searchFilters,
  ...props
}: SearchHeaderCtaProps) => {
  const { palettes, fontSizes } = useTheme();
  const { navigate } = useNavigation<NavigationProp<PlacesStackParamList>>();

  return (
    <IconButton
      icon={faSearch}
      color={palettes.primary[400]}
      size={fontSizes.lg}
      onPress={() => navigate('PlacesSearch', searchFilters ?? {})}
      {...props}
    />
  );
};
