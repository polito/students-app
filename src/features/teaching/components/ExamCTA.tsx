import { useTranslation } from 'react-i18next';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ExamStatusEnum } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onlineManager } from '@tanstack/react-query';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import {
  useBookExam,
  useCancelExamBooking,
} from '../../../core/queries/examHooks';
import { Exam } from '../../../core/types/api';
import { TeachingStackParamList } from './TeachingNavigator';

interface Props {
  exam: Exam;
  absolute?: boolean;
}

export const ExamCTA = ({ exam, absolute = false }: Props) => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const { navigate, reset } =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();

  const { mutateAsync: bookExam, isLoading: isBooking } = useBookExam(exam.id);
  const { mutateAsync: cancelBooking, isLoading: isCancelingBooking } =
    useCancelExamBooking(exam.id);

  const examRequestable = exam?.status === ExamStatusEnum.Requestable;
  const examAvailable = exam?.status === ExamStatusEnum.Available;
  const examUnavailable = exam?.status === ExamStatusEnum.Unavailable;

  const confirm = useConfirmationDialog();

  const disabledStatuses = [
    ExamStatusEnum.RequestAccepted,
    ExamStatusEnum.RequestRejected,
  ] as ExamStatusEnum[];
  const action = async () => {
    if (examRequestable) {
      return navigate('ExamRequest', { id: exam.id });
    } else if (examAvailable) {
      if (exam.question) {
        return navigate('ExamQuestion', { id: exam.id });
      } else {
        return bookExam({
          courseShortcode: exam.courseShortcode,
        }).then(() => {
          setFeedback({ text: t('examScreen.ctaBookSuccess') });
          // reset navigation to TeachingScreen
          reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        });
      }
    }
    if (await confirm()) {
      return cancelBooking().then(() => {
        setFeedback({ text: t('examScreen.ctaCancelSuccess') });
        // reset navigation to TeachingScreen
        reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    }
    return Promise.reject();
  };

  if (disabledStatuses.includes(exam.status)) return null;

  const mutationsLoading = isBooking || isCancelingBooking;

  return (
    <CtaButton
      destructive={!examAvailable && !examRequestable}
      title={
        examUnavailable
          ? t('examScreen.notAvailable')
          : examRequestable
          ? t('examScreen.ctaRequest')
          : examAvailable
          ? t('examScreen.ctaBook')
          : t('examScreen.ctaCancel')
      }
      action={action}
      loading={mutationsLoading}
      disabled={!onlineManager.isOnline() || examUnavailable}
      variant="filled"
      absolute={absolute}
      containerStyle={{ paddingVertical: 0 }}
    />
  );
};
