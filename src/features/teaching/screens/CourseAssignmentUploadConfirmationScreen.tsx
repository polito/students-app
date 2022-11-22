import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { TextButton } from '@lib/ui/components/TextButton';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useUploadAssignment } from '../../../core/queries/courseHooks';
import { globalStyles } from '../../../core/styles/globalStyles';
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
        <TextField
          label={t('courseAssignmentUploadConfirmationScreen.descriptionLabel')}
          style={styles.textField}
          inputStyle={styles.input}
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
            },
            styles.preview,
            globalStyles.grow,
          ]}
        />
      )}
      {/\.jpe?g|gif|png|heic$/i.test(fileUri) && (
        <ScrollView
          contentContainerStyle={[
            globalStyles.grow,
            {
              paddingBottom: tabBarHeight,
            },
          ]}
          centerContent
          minimumZoomScale={0.5}
        >
          <Image
            source={{ uri: fileUri }}
            style={globalStyles.grow}
            resizeMode="contain"
          />
        </ScrollView>
      )}
    </>
  );
};
const createStyles = ({ colors, spacing, shapes }: Theme) =>
  StyleSheet.create({
    toolbar: {
      justifyContent: 'space-between',
      backgroundColor: Platform.select({
        ios: colors.headers,
        android: colors.surface,
      }),
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
    },
    preview: {
      width: Dimensions.get('window').width,
    },
    input: {
      margin: 0,
      borderBottomWidth: 0,
      paddingVertical: spacing[Platform.OS === 'ios' ? 2 : 1],
    },
    textField: {
      backgroundColor: 'rgba(0, 0, 0, .1)',
      borderRadius: shapes.md,
      paddingVertical: 0,
      marginHorizontal: spacing[2],
    },
  });
