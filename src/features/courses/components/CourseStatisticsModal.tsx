import { useTranslation } from 'react-i18next';

import { CourseStatisticsModalContent } from './CourseStatisticsModalContent.tsx';

export enum CourseStatisticsTypes {
  enrolledExamBottomSheet,
  enrolledExamDetailBottomSheet,
  gradesDetailBottomSheet,
}

interface Props {
  type: CourseStatisticsTypes;
  onDismiss: () => void;
}

export const CourseStatisticsModal = ({ type, onDismiss }: Props) => {
  const { t } = useTranslation();

  const items = [
    {
      title: t('courseStatisticsScreen.enrolledExamBottomSheet.title'),
      content: t('courseStatisticsScreen.enrolledExamBottomSheet.content'),
      itemList: [
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
      ],
    },
    {
      title: t('courseStatisticsScreen.enrolledExamDetailBottomSheet.title'),
      content: t(
        'courseStatisticsScreen.enrolledExamDetailBottomSheet.content',
      ),
      itemList: [
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
      ],
    },
    {
      title: t('courseStatisticsScreen.gradesDetailBottomSheet.title'),
      content: t('courseStatisticsScreen.gradesDetailBottomSheet.content'),
      itemList: [
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
      ],
    },
  ];

  const item = items[type];

  return (
    <CourseStatisticsModalContent
      title={item.title}
      content={item.content}
      itemList={item.itemList}
      onDismiss={onDismiss}
    />
  );
};
