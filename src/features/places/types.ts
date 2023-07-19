import { Palette } from '@lib/ui/types/Theme';

export interface CategoryData {
  icon: string;
  color: string;
  shade?: keyof Palette;
  priority: number;
  children: Record<string, Partial<CategoryData>>;
}
