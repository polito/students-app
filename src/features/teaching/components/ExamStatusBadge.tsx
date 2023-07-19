import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleMinus,
  faCircleXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { Exam } from '../../../core/types/api';

interface Props {
  exam: Exam;
  textOnly?: boolean;
}

export const ExamStatusBadge = ({ exam, textOnly }: Props) => {
  const { t } = useTranslation();
  const { fontSizes, dark, palettes, shapes, spacing } = useTheme();

  const [backgroundColor, foregroundColor] = useMemo((): [string, string] => {
    switch (exam.statusIcon) {
      case faCircleCheck:
        return [palettes.success[200], palettes.success[800]];
      case faSpinner:
        return [palettes.warning[200], palettes.success[800]];
      case faCircleXmark:
        return [palettes.danger[200], palettes.danger[800]];
      case faCircleMinus:
        return [palettes.muted[200], palettes.muted[600]];
      default:
        return [palettes.primary[100], palettes.primary[600]];
    }
  }, [
    exam.statusIcon,
    palettes.success,
    palettes.warning,
    palettes.danger,
    palettes.muted,
    palettes.primary,
    dark,
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
        <Icon
          icon={exam.statusIcon}
          size={fontSizes.md}
          color={foregroundColor}
        />
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
