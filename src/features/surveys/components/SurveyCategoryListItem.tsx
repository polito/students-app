import { useTranslation } from 'react-i18next';

import { Badge } from '@lib/ui/components/Badge';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { IS_IOS } from '../../../core/constants';
import { SurveyType } from '../types/SurveyType';

type Props = {
  type: SurveyType;
} & Omit<ListItemProps, 'title'>;

export const SurveyCategoryListItem = ({ type, ...props }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <ListItem
      {...props}
      title={type.name}
      linkTo={{
        screen: 'CpdSurveys',
        params: {
          categoryId: type.categoryId,
          typeId: type.typeId,
          typeName: type.name,
        },
      }}
      trailingItem={
        <Row gap={2} align="center">
          <Badge
            foregroundColor={styles.badge.foreground}
            backgroundColor={styles.badge.background}
            text={t('common.remaining', { value: type.incompleteCount })}
          />
          {IS_IOS && <DisclosureIndicator />}
        </Row>
      }
    />
  );
};

const createStyles = ({ dark, palettes }: Theme) => ({
  badge: {
    background: dark ? palettes.danger[800] : palettes.danger[200],
    foreground: dark ? palettes.danger[200] : palettes.danger[800],
  },
});
