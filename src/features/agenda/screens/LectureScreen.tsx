import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { LiveIndicator } from '@lib/ui/components/LiveIndicator';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Row } from '@lib/ui/components/Row';
import { SectionList } from '@lib/ui/components/SectionList';
import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { item: lecture } = route.params;

  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const teacherQuery = useGetPerson(lecture.teacherId);
  const { data: virtualClassrooms } = useGetCourseVirtualClassrooms(
    lecture.courseId,
  );
  // TODO REFACTOR, JUST A TEST
  const virtualClassroom = virtualClassrooms?.data.find(
    l => l.id === lecture?.virtualClassrooms[0].id ?? false,
  );

  const live = false;

  const onPressMaterialCard = () => {
    navigation.navigate({
      name: 'LectureCourseDirectory',
      params: {
        lectureId: lecture.id,
        courseId: lecture.courseId,
      },
    });
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.wrapper}
      >
        {virtualClassroom?.videoUrl && (
          <VideoPlayer
            videoUrl={virtualClassroom?.videoUrl}
            coverUrl={virtualClassroom?.coverUrl}
          />
        )}
        <Row maxWidth noFlex spaceBetween alignCenter>
          <EventDetails
            title={lecture?.title}
            type={t('common.lecture')}
            time={`${convertMachineDateToFormatDate(lecture.date)} ${
              lecture.fromTime
            } - ${lecture.toTime}`}
          />
          {live && (
            <Row alignEnd noFlex justifyEnd>
              <LiveIndicator />
            </Row>
          )}
        </Row>
        <SectionList>
          <ListItem
            leadingItem={
              <Icon icon={faLocation} size={20} style={styles.iconStyle} />
            }
            title={lecture.place.name}
          />
          <PersonListItem
            person={teacherQuery.data?.data}
            subtitle={t('common.teacher')}
          />
          <DirectoryListItem
            title={t('Material')}
            subtitle={t('lectureScreen.goToMaterial')}
            onPress={onPressMaterialCard}
          />
        </SectionList>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
  StyleSheet.create({
    iconStyle: {
      color: colors.secondaryText,
      marginRight: spacing[2],
    },
    sectionSeparator: {
      paddingHorizontal: fontSizes.lg,
      marginTop: fontSizes.xs,
    },
    sectionContainer: {
      paddingHorizontal: fontSizes.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: spacing[2],
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: fontSizes.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
