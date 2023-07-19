import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ExamStatusEnum } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import {
  useBookExam,
  useCancelExamBooking,
} from '../../../core/queries/examHooks';
import { Exam } from '../../../core/types/api';
import { TeachingStackParamList } from './TeachingNavigator';

interface Props {
  exam: Exam;
}

export const ExamCTA = ({ exam }: Props) => {
  const { t } = useTranslation();

  const { navigate } =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();

  const label = useMemo(() => {}, [exam, t]);

  const { mutateAsync: bookExam, isLoading: isBooking } = useBookExam(exam.id);
  const { mutateAsync: cancelBooking, isLoading: isCancelingBooking } =
    useCancelExamBooking(exam.id);

  const examAvailable = exam?.status === ExamStatusEnum.Available;

  const confirm = useConfirmationDialog();

  const disabledStatuses = [
    ExamStatusEnum.RequestRejected,
    ExamStatusEnum.Unavailable,
  ] as ExamStatusEnum[];
  const action = async () => {
    if (examAvailable) {
      if (exam.question) {
        return navigate('ExamQuestion', { id: exam.id });
      } else {
        return bookExam({});
      }
    }
    if (await confirm()) {
      return cancelBooking();
    }
    return Promise.reject();
  };

  if (disabledStatuses.includes(exam.status)) return null;

  // const showCta = useMemo(() => {
  //   if (!exam) return false;
  //
  //   if (
  //     exam.status === ExamStatusEnum.Available &&
  //     exam.bookingEndsAt &&
  //     exam.bookingEndsAt.getTime() < Date.now()
  //   )
  //     return false;
  //
  //   if (
  //     exam.status === ExamStatusEnum.Available &&
  //     exam.bookingStartsAt &&
  //     exam.bookingStartsAt.getTime() > Date.now()
  //   )
  //     return false;
  //
  //   return (
  //     [ExamStatusEnum.Available, ExamStatusEnum.Booked] as ExamStatusEnum[]
  //   ).includes(exam.status);
  // }, [exam]);

  const mutationsLoading = isBooking || isCancelingBooking;

  return (
    <CtaButton
      destructive={!examAvailable}
      title={
        examAvailable ? t('examScreen.ctaBook') : t('examScreen.ctaCancel')
      }
      action={action}
      loading={mutationsLoading}
      successMessage={
        examAvailable
          ? t('examScreen.ctaBookSuccess')
          : t('examScreen.ctaCancelSuccess')
      }
    />
  );
};
