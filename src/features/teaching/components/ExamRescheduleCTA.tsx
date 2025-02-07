import { useTranslation } from 'react-i18next';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Exam } from '../../../core/types/api';
import { TeachingStackParamList } from './TeachingNavigator';

interface Props {
  exam: Exam;
}

export const ExamRescheduleCTA = ({ exam }: Props) => {
  const { navigate } =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();
  const { t } = useTranslation();
  return (
    <CtaButton
      title={t('examRescheduleScreen.ctaRequest')}
      action={() => navigate('ExamReschedule', { id: exam.id })}
      absolute={false}
      containerStyle={{ paddingVertical: 0 }}
      variant="outlined"
    />
  );
};
