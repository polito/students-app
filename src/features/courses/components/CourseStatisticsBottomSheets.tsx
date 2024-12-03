import { GestureHandlerRootView } from 'react-native-gesture-handler';

import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { BottomSheet } from '@lib/ui/components/BottomSheet';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseStatisticsBottomSheetContent } from './CourseStatisticsBottomSheetContent';

type ChildrenParams = {
  onPresentEnrolledExamModalPress: () => void;
  onPresentEnrolledExamDetailModalPress: () => void;
  onPresentGradesDetailModalPress: () => void;
};
type Props = {
  children: (params: ChildrenParams) => React.ReactElement;
};
export const CourseStatisticsBottomSheets = ({ children }: Props) => {
  const { t } = useTranslation();
  const enrolledExamBottomSheetModalRef = useRef<BottomSheetMethods>(null);
  const enrolledExamDetailBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const gradesDetailBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const onPresentEnrolledExamModalPress = useCallback(() => {
    enrolledExamBottomSheetModalRef.current?.snapToIndex(1);
  }, []);

  const onDismissEnrolledExamModal = useCallback(() => {
    enrolledExamBottomSheetModalRef.current?.close();
  }, []);
  const onPresentEnrolledExamDetailModalPress = useCallback(() => {
    enrolledExamDetailBottomSheetModalRef.current?.snapToIndex(1);
  }, []);
  const onDismissEnrolledExamDetailModal = useCallback(() => {
    enrolledExamDetailBottomSheetModalRef.current?.close();
  }, []);
  const onPresentGradesDetailModalPress = useCallback(() => {
    gradesDetailBottomSheetModalRef.current?.snapToIndex(1);
  }, []);
  const onDismissGradesDetailModal = useCallback(() => {
    gradesDetailBottomSheetModalRef.current?.close();
  }, []);

  const snapPoints = [1, '60%', '100%'];

  return (
    <GestureHandlerRootView style={GlobalStyles.grow}>
      <BottomSheetModalProvider>
        {children({
          onPresentEnrolledExamModalPress,
          onPresentEnrolledExamDetailModalPress,
          onPresentGradesDetailModalPress,
        })}
        <BottomSheet
          ref={enrolledExamBottomSheetModalRef}
          handleComponent={null}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          enableDynamicSizing={true}
          backdropComponent={BottomSheetBackdrop}
        >
          <CourseStatisticsBottomSheetContent
            title={t('courseStatisticsScreen.enrolledExamBottomSheet.title')}
            content={t(
              'courseStatisticsScreen.enrolledExamBottomSheet.content',
            )}
            itemList={[
              {
                title: t(
                  'courseStatisticsScreen.enrolledExamBottomSheet.item1.title',
                ),
                content: t(
                  'courseStatisticsScreen.enrolledExamBottomSheet.item1.content',
                ),
              },
              {
                title: t(
                  'courseStatisticsScreen.enrolledExamBottomSheet.item2.title',
                ),
                content: t(
                  'courseStatisticsScreen.enrolledExamBottomSheet.item2.content',
                ),
              },
            ]}
            onDismiss={onDismissEnrolledExamModal}
          />
        </BottomSheet>
        <BottomSheet
          ref={enrolledExamDetailBottomSheetModalRef}
          handleComponent={null}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          enableDynamicSizing={true}
          backdropComponent={BottomSheetBackdrop}
        >
          <CourseStatisticsBottomSheetContent
            title={t(
              'courseStatisticsScreen.enrolledExamDetailBottomSheet.title',
            )}
            content={t(
              'courseStatisticsScreen.enrolledExamDetailBottomSheet.content',
            )}
            itemList={[
              {
                title: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item1.title',
                ),
                content: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item1.content',
                ),
              },
              {
                title: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item2.title',
                ),
                content: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item2.content',
                ),
              },
              {
                title: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item3.title',
                ),
                content: t(
                  'courseStatisticsScreen.enrolledExamDetailBottomSheet.item3.content',
                ),
              },
            ]}
            onDismiss={onDismissEnrolledExamDetailModal}
          />
        </BottomSheet>
        <BottomSheet
          ref={gradesDetailBottomSheetModalRef}
          snapPoints={snapPoints}
          handleComponent={null}
          index={-1}
          enablePanDownToClose={true}
          enableDynamicSizing={true}
          backdropComponent={BottomSheetBackdrop}
        >
          <CourseStatisticsBottomSheetContent
            title={t('courseStatisticsScreen.gradesDetailBottomSheet.title')}
            content={t(
              'courseStatisticsScreen.gradesDetailBottomSheet.content',
            )}
            itemList={[
              {
                title: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item1.title',
                ),
                content: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item1.content',
                ),
              },
              {
                title: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item2.title',
                ),
                content: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item2.content',
                ),
              },
              {
                title: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item3.title',
                ),
                content: t(
                  'courseStatisticsScreen.gradesDetailBottomSheet.item3.content',
                ),
              },
            ]}
            onDismiss={onDismissGradesDetailModal}
          />
        </BottomSheet>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
