import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleMinus,
  faCircleXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';

import { lightTheme } from '../../../core/themes/light';
import { Exam } from '../../../core/types/api';

interface Props {
  exam: Exam;
  textOnly?: boolean;
}

export const ExamStatusBadge = ({ exam, textOnly }: Props) => {
  const { t } = useTranslation();
  const { fontSizes, colors, dark, palettes, shapes, spacing } = useTheme();

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
    <Row
      gap={2}
      style={[
        {
          backgroundColor: backgroundColor,
          paddingLeft: spacing[1.5],
          paddingRight: spacing[2],
          paddingVertical: spacing[1],
          borderRadius: shapes.xl,
        },
        textOnly && {
          paddingRight: spacing[1.5],
        },
      ]}
    >
      {!textOnly && (
        <Icon icon={statusIcon} size={fontSizes.md} color={foregroundColor} />
      )}
      <Text
        style={{ color: foregroundColor, fontSize: fontSizes.xs }}
        weight="medium"
      >
        {t(`common.examStatus.${exam.status}`)}
      </Text>
    </Row>
  );
};
