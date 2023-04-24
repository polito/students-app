import { useTranslation } from 'react-i18next';

interface AccessibilityListLabelProps {
  total: number;
  index: number;
  contentLabel?: string;
}

export const useAccessibilityListLabel = ({
  index,
  total,
}: AccessibilityListLabelProps) => {
  const { t } = useTranslation();

  return t('common.elementCount', {
    count: index,
    total: total,
  });
};
