import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useAccessibility() {
  const { t } = useTranslation();

  const accessibilityListLabel = useCallback(
    (index: number, total: number, extraText?: string) => {
      const text = t('common.elementCount', {
        count: index,
        total: total,
      });
      return `${text} ${extraText ?? ''}`;
    },
    [t],
  );

  return {
    accessibilityListLabel,
  };
}
