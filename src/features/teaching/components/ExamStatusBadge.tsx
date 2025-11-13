import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleMinus,
  faCircleXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';

import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { lightTheme } from '../../../core/themes/light';
import { Exam } from '../../../core/types/api';

interface Props {
  exam: Exam;
  textOnly?: boolean;
}

export const ExamStatusBadge = ({ exam, textOnly }: Props) => {
  const { t } = useTranslation();
  const { dark, palettes } = useTheme();
  const { accessibility } = usePreferencesContext();
  const statusIcon = useMemo(() => {
    switch (exam.status) {
      case ExamStatusEnum.Booked:
      case ExamStatusEnum.RequestAccepted:
        return faCircleCheck;
      case ExamStatusEnum.Requested:
        return faSpinner;
      case ExamStatusEnum.RequestRejected:
        return faCircleXmark;
      case ExamStatusEnum.Unavailable:
        return faCircleMinus;
      default:
        return faCircle;
    }
  }, [exam.status]);

  const [backgroundColor, foregroundColor] = useMemo((): [string, string] => {
    const darkBackgroundOpacity = 'CC';
    switch (statusIcon.iconName) {
      case faCircleCheck.iconName:
        return dark
          ? [
              palettes.success[800] + darkBackgroundOpacity,
              palettes.success[200],
            ]
          : [palettes.success[200], palettes.success[800]];
      case faSpinner.iconName:
        return dark
          ? [
              palettes.warning[800] + darkBackgroundOpacity,
              palettes.warning[200],
            ]
          : [palettes.warning[200], palettes.warning[800]];
      case faCircleXmark.iconName:
        return dark
          ? [palettes.danger[800] + darkBackgroundOpacity, palettes.danger[200]]
          : [palettes.danger[200], palettes.danger[800]];
      case faCircleMinus.iconName:
        return dark
          ? [palettes.muted[600] + darkBackgroundOpacity, palettes.muted[200]]
          : [palettes.muted[200], palettes.muted[600]];
      default:
        return dark
          ? [palettes.primary[500] + '99', lightTheme.colors.surface]
          : [palettes.primary[100], palettes.primary[600]];
    }
  }, [
    statusIcon,
    dark,
    palettes.success,
    palettes.warning,
    palettes.danger,
    palettes.muted,
    palettes.primary,
  ]);
  return (
    <Badge
      text={t(`common.examStatus.${exam.status}`)}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
      icon={
        textOnly || Number(accessibility?.fontSize) >= 150
          ? undefined
          : statusIcon
      }
      style={{
        alignItems: 'center',
      }}
    />
  );
};
