import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import {
  ProvisionalGrade,
  ProvisionalGradeStateEnum,
} from '@polito/api-client/models/ProvisionalGrade';

import { TextWithLinks } from '../../../core/components/TextWithLinks';
import { IS_IOS } from '../../../core/constants';
import { dateFormatter, formatDate } from '../../../utils/dates';
import { useGetRejectionTime } from '../hooks/useGetRejectionTime';
import { ProvisionalGradeStatusBadge } from './ProvisionalGradeStatusBadge';

type Props = {
  grade: ProvisionalGrade;
};

export const ProvisionalGradeListItem = ({ grade }: Props) => {
  const { t } = useTranslation();

  const styles = useStylesheet(createStyles);
  const isRejected = grade.state === ProvisionalGradeStateEnum.Rejected;

  const rejectionTime = useGetRejectionTime({
    rejectingExpiresAt: grade.rejectingExpiresAt,
    isCompact: true,
  });

  const formatHHmm = dateFormatter('HH:mm');
  const subtitle = useMemo(() => {
    switch (grade.state) {
      case ProvisionalGradeStateEnum.Confirmed:
        if (grade.canBeRejected) {
          return (
            <TextWithLinks style={styles.rejectableSubtitle}>
              {t('transcriptGradesScreen.rejectionCountdown', {
                hours: rejectionTime,
              })}
            </TextWithLinks>
          );
        }
        break;
      case ProvisionalGradeStateEnum.Rejected:
        return t('transcriptGradesScreen.rejectedSubtitle', {
          date: formatDate(grade.rejectedAt!),
          time: formatHHmm(grade.rejectedAt!),
        });
      default:
        return undefined;
    }
  }, [grade.rejectedAt, grade.state, rejectionTime, t]);

  return (
    <ListItem
      title={grade.courseName}
      subtitle={subtitle}
      subtitleStyle={
        grade.state === ProvisionalGradeStateEnum.Confirmed
          ? styles.rejectableSubtitle
          : styles.subtitle
      }
      disabled={isRejected}
      linkTo={
        isRejected
          ? undefined
          : {
              screen: 'ProvisionalGrade',
              params: { id: grade.id },
            }
      }
      trailingItem={
        <Row align="center" pl={2}>
          <ProvisionalGradeStatusBadge grade={grade} />
          {IS_IOS && !isRejected ? <DisclosureIndicator /> : undefined}
        </Row>
      }
    />
  );
};

const createStyles = ({ colors, dark, palettes, fontSizes }: Theme) => ({
  subtitle: {
    color: colors.title,
  },
  rejectableSubtitle: {
    fontSize: fontSizes.sm,
    color: dark ? palettes.danger[300] : palettes.danger[700],
  },
});
