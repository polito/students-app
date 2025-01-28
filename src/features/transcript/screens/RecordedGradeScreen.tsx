import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { BottomModal } from '../../../core/components/BottomModal';
import { useBottomModal } from '../../../core/hooks/useBottomModal';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { formatDate } from '../../../utils/dates';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'RecordedGrade'>;
export const RecordedGradeScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { grade } = route.params;
  const { fontSizes, colors } = useTheme();

  const teacherIds = grade.teacherId !== null ? grade.teacherId : undefined;
  const staffQueries = useGetPerson(teacherIds);

  const styles = useStylesheet(createStyles);
  const isNumber = (value: string): boolean => !isNaN(Number(value));

  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();

  const onPressEvent = () => {
    showBottomModal(
      <ModalContent
        title={t('recordedGradeScreen.titleOnTimePoint')}
        close={closeBottomModal}
      >
        <View style={styles.textModal}>
          <Text>{t('recordedGradeScreen.textModal')}</Text>
          <CtaButton
            title={t('recordedGradeScreen.ctaButtonModal')}
            action={() => navigation.navigate('TranscriptCareer')}
            absolute={false}
            containerStyle={{ paddingHorizontal: 0 }}
          />
        </View>
      </ModalContent>,
    );
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl queries={[staffQueries]} manual />}
      >
        {!grade ? (
          <ActivityIndicator />
        ) : (
          <SafeAreaView>
            <Row pb={0} ph={5} pt={5} gap={2}>
              <Col
                flexGrow={1}
                flexShrink={1}
                gap={2}
                style={{ marginBottom: 20 }}
              >
                <ScreenTitle title={grade.courseName} />
                <View>
                  <Text>{`${formatDate(new Date(grade.date))} - ${t(
                    'common.creditsWithUnit',
                    {
                      credits: grade.credits,
                    },
                  )}`}</Text>
                </View>
              </Col>
              <Col
                align="center"
                justify="center"
                mt={2}
                flexShrink={0}
                style={styles.grade}
              >
                <Text
                  style={
                    grade.grade.length < 3
                      ? styles.gradeText
                      : styles.longGradeText
                  }
                  numberOfLines={1}
                >
                  {isNumber(grade.grade)
                    ? grade.grade
                    : grade.grade.charAt(0).toUpperCase() +
                      grade.grade.slice(1).toLowerCase()}
                </Text>
              </Col>
            </Row>
            <Section>
              {!!grade.onTimeExamPoints && (
                <>
                  <SectionHeader
                    separator={false}
                    title={t('recordedGradeScreen.additionalPoint')}
                    trailingIcon={{
                      onPress: onPressEvent,
                      icon: faQuestionCircle,
                      color: colors.link,
                    }}
                  />
                  <OverviewList indented loading={!grade}>
                    <ListItem
                      leadingItem={
                        <Icon icon={faFlagCheckered} size={fontSizes['2xl']} />
                      }
                      title={t('recordedGradeScreen.titleOnTimePoint')}
                      trailingItem={
                        <Text style={styles.onTimeItem}>
                          {'+' + grade.onTimeExamPoints}
                        </Text>
                      }
                    />
                  </OverviewList>
                </>
              )}
            </Section>

            <Section>
              {staffQueries.data && (
                <>
                  <SectionHeader title={t('recordedGradeScreen.staff')} />
                  <OverviewList
                    indented
                    loading={!grade || staffQueries.isLoading}
                  >
                    <PersonListItem
                      key={`${staffQueries.data.id}`}
                      person={staffQueries.data}
                      subtitle={t('recordedGradeScreen.teacher')}
                    />
                  </OverviewList>
                </>
              )}
            </Section>
          </SafeAreaView>
        )}
        <BottomBarSpacer />
      </ScrollView>
      <BottomModal dismissable {...bottomModal} />
    </>
  );
};

const createStyles = ({
  colors,
  fontSizes,
  spacing,
  fontWeights,
  palettes,
  dark,
}: Theme) =>
  StyleSheet.create({
    grade: {
      minWidth: 60,
      height: 60,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing[2],
    },
    gradeText: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
    },
    longGradeText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
    },
    onTimeItem: {
      fontWeight: 'bold',
      fontSize: fontSizes.xl,
      color: palettes.success[dark ? 400 : 700],
    },
    textModal: {
      padding: spacing[7],
      gap: spacing[2],
    },
  });
