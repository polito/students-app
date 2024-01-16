import { useMemo } from 'react';

import { Badge } from '@lib/ui/components/Badge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import {
  ProvisionalGrade,
  ProvisionalGradeStateEnum,
} from '@polito/api-client/models/ProvisionalGrade';

import { lightTheme } from '../../../core/themes/light';

type Props = {
  grade: ProvisionalGrade;
};

export const ProvisionalGradeStatusBadge = ({ grade }: Props) => {
  const { palettes, dark } = useTheme();

  const [backgroundColor, foregroundColor] = useMemo((): [string, string] => {
    switch (grade.state) {
      case ProvisionalGradeStateEnum.Confirmed:
        return dark
          ? [palettes.primary[500] + '99', lightTheme.colors.surface]
          : [palettes.primary[100], palettes.primary[600]];
      case ProvisionalGradeStateEnum.Rejected:
        return dark
          ? [palettes.gray[600], palettes.gray[100]]
          : [palettes.gray[200], palettes.gray[600]];
      default:
        return dark
          ? [palettes.warning[800], palettes.warning[200]]
          : [palettes.warning[200], palettes.warning[800]];
    }
  }, [dark, grade.state, palettes]);

  return (
    <Badge
      text={grade.stateDescription}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    />
  );
};
