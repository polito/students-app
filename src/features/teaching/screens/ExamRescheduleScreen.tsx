import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { Checkbox } from '../../../core/components/Checkbox';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useSafeBottomBarHeight } from '../../../core/hooks/useSafeBottomBarHeight';
import {
  useGetExams,
  useRescheduleRequest,
} from '../../../core/queries/examHooks';
import { ExamRescheduleComponent } from '../components/ExamRescheduleComponent';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'ExamReschedule'>;

export const ExamRescheduleScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const examsQuery = useGetExams();
  const exam = examsQuery.data?.find(e => e.id === id);
  const { left, right } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();
  const bottomBarHeight = useSafeBottomBarHeight();
  const { mutateAsync: request, isLoading: isBooking } =
    useRescheduleRequest(id);

  const [firstState, setFirstState] = useState<{
    isError: boolean;
    value?: string;
  }>({
    isError: false,
    value: undefined,
  });
  const [secondState, setSecondState] = useState<{
    isError: boolean;
    value?: string;
  }>({
    isError: false,
    value: undefined,
  });
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    (firstState.isError ||
      secondState.isError ||
      firstState.value?.length === 0 ||
      secondState.value?.length === 0) &&
      setIsCheck(false);
  }, [firstState, secondState]);

  const onSubmit = async () => {
    if (!isCheck || !firstState.value || !secondState.value) {
      return;
    }
    request({
      courseShortcode: exam!.courseShortcode,
      requestReason: firstState.value,
      requestDetails: secondState.value,
    }).then(() => {
      setFeedback({ text: t('examRescheduleScreen.ctaRescheduleSuccess') });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  };

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <SafeAreaView>
          <ExamRescheduleComponent
            setFirstState={setFirstState}
            firstState={firstState}
            secondState={secondState}
            setSecondState={setSecondState}
          />
        </SafeAreaView>
      </ScrollView>
      <CtaButtonSpacer />
      <BottomBarSpacer />
      <View
        style={{
          position: 'absolute',
          width: Platform.select({ android: '100%' }),
          left: Platform.select({ ios: left }),
          right,
          bottom: bottomBarHeight,
          backgroundColor: colors.background, // da cambiare
          paddingTop: 10,
        }}
      >
        <Checkbox
          text={t('examRescheduleScreen.responsibilityDeclaration')}
          onPress={() => setIsCheck(!isCheck)}
          isChecked={isCheck}
          disable={
            firstState.isError ||
            secondState.isError ||
            !firstState.value?.length ||
            !secondState.value?.length
          }
        />
        <CtaButton
          title={t('examRescheduleScreen.button')}
          action={onSubmit}
          loading={isBooking}
          disabled={!isCheck}
          absolute={false}
        />
      </View>
    </>
  );
};
