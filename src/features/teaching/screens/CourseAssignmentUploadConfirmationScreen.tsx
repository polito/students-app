import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useUploadAssignment } from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUploadConfirmation'
>;

const toolbarHeight = 46;

export const CourseAssignmentUploadConfirmationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId, fileUri } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const uploadMutation = useUploadAssignment(courseId);
  const styles = useStylesheet(createStyles);
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const [description, setDescription] = useState('');

  const uploadFile = () => {
    if (!description) return;

    fetch(fileUri)
      .then(response => response.blob())
      .then(file => {
        uploadMutation.mutate({
          courseId,
          description,
          file,
        });
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    // TODO loading feedback
    navigation.setOptions({
      headerRight: () =>
        Platform.select({
          android: (
            <IconButton
              icon={faPaperPlane}
              size={fontSizes.xl}
              color={colors.heading}
              onPress={uploadFile}
              accessibilityLabel={t(
                'courseAssignmentUploadConfirmationScreen.ctaUpload',
              )}
            />
          ),
          ios: (
            <TextButton onPress={uploadFile}>
              {t('courseAssignmentUploadConfirmationScreen.ctaUpload')}
            </TextButton>
          ),
        }),
    });
  }, []);

  return (
    <>
      <View
        style={[
          {
            height: toolbarHeight,
          },
          styles.toolbar,
        ]}
      >
        <TranslucentTextField
          label={t('courseAssignmentUploadConfirmationScreen.descriptionLabel')}
          autoCorrect={false}
          value={description}
          onChangeText={value => setDescription(value)}
        />
      </View>

      {fileUri.endsWith('pdf') && (
        <Pdf
          source={{ uri: fileUri }}
          style={[
            {
              paddingBottom: tabBarHeight,
              width,
            },
            GlobalStyles.grow,
          ]}
        />
      )}
      {/\.jpe?g|gif|png|heic$/i.test(fileUri) && (
        <ScrollView
          contentContainerStyle={[
            GlobalStyles.grow,
            {
              paddingBottom: tabBarHeight,
            },
          ]}
          centerContent
          minimumZoomScale={0.5}
        >
          <Image
            source={{ uri: fileUri }}
            style={GlobalStyles.grow}
            resizeMode="contain"
          />
        </ScrollView>
      )}
    </>
  );
};
const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    toolbar: {
      justifyContent: 'space-between',
      backgroundColor: Platform.select({
        ios: colors.headersBackground,
        android: colors.surface,
      }),
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
    },
  });
