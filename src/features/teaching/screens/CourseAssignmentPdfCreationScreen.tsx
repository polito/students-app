import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewToken,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { cleanSingle, openCamera } from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faCircle,
  faCircleDot,
  faTrashCan,
} from '@fortawesome/free-regular-svg-icons';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { displayTabBar, hideTabBar } from '../../../utils/tab-bar';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentPdfCreation'
>;

const windowDimensions = Dimensions.get('window');
const PAGE_MARGIN = 20;

export const CourseAssignmentPdfCreationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId, firstImageUri } = route.params;

  const [imageUris, setImageUris] = useState<string[]>([firstImageUri]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isCreatingPDF, setIsCreatingPDF] = useState(false);

  const pageSliderRef = useRef<FlatList>();

  useEffect(() => {
    const rootNav = navigation.getParent();
    hideTabBar(rootNav);
    return () => displayTabBar(rootNav);
  }, []);

  const addPage = () => {
    openCamera({
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
    })
      .then(image => {
        console.log(image.path);
        setImageUris(oldUris => [...oldUris, image.path]);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deletePage = () => {
    cleanSingle(imageUris[currentPageIndex])
      .then(() => {
        const currentPageCount = imageUris.length;
        if (currentPageCount === 1) {
          navigation.goBack();
          return;
        }

        setImageUris(oldUris => {
          return oldUris.filter((uri, index) => index !== currentPageIndex);
        });

        if (currentPageCount - 1 === currentPageIndex) {
          pageSliderRef.current.scrollToIndex({
            animated: true,
            index: currentPageIndex - 1,
          });
        }
      })
      .catch(e => {
        console.error(e);
      });
  };

  const createPdf = async () => {
    setIsCreatingPDF(true);

    const pages = imageUris.map(
      uri =>
        `<img style='width: 100vw; height: 100vh; object-fit: contain' src='${uri}'/>`,
    );

    RNHTMLtoPDF.convert({
      fileName: 'assignment',
      html: pages.join(''),
    })
      .then(pdf => {
        console.log(pdf.filePath);

        navigation.navigate('CourseAssignmentUploadConfirmation', {
          courseId,
          fileUri: pdf.filePath,
        });
      })
      .catch(e => {
        // TODO notify user
        console.error(e);
      })
      .finally(() => setIsCreatingPDF(false));
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 1) {
        setCurrentPageIndex(viewableItems[0].index);
      }
    },
  );

  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const { bottom: marginBottom } = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { marginBottom }]}>
      <Animated.FlatList
        ref={pageSliderRef}
        data={imageUris}
        horizontal
        pagingEnabled
        keyExtractor={item => item}
        onViewableItemsChanged={onViewableItemsChanged.current}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image
              resizeMode="contain"
              source={{ uri: item }}
              style={styles.pageImage}
            />
          </View>
        )}
        contentContainerStyle={styles.sliderContentContainer}
        extraData={imageUris}
      />
      <View>
        <View style={styles.dotsContainer}>
          {imageUris.map((_, index) =>
            index === currentPageIndex ? (
              <Icon icon={faCircleDot} style={styles.dot} key={index} />
            ) : (
              <Icon icon={faCircle} style={styles.dot} key={index} />
            ),
          )}
        </View>
        <View style={styles.actionsContainer}>
          <Action
            disabled={isCreatingPDF}
            icon={faAdd}
            label={t('courseAssignmentPdfCreationScreen.ctaAddPage')}
            onPress={addPage}
          />
          <Action
            disabled={isCreatingPDF}
            icon={faTrashCan}
            label={t('courseAssignmentPdfCreationScreen.ctaDeletePage')}
            onPress={deletePage}
          />
          <Action
            disabled={isCreatingPDF}
            loading={isCreatingPDF}
            icon={faCheckCircle}
            label={t('courseAssignmentPdfCreationScreen.ctaConfirm')}
            onPress={createPdf}
          />
        </View>
      </View>
    </View>
  );
};

interface ActionProps {
  disabled?: boolean;
  icon: IconDefinition;
  label: string;
  loading?: boolean;
  onPress: () => void;
}

const Action = ({
  disabled = false,
  icon,
  label,
  loading = false,
  onPress,
}: ActionProps) => {
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes } = useTheme();
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.actionHighlight}
      underlayColor={colors.touchableHighlight}
      disabled={disabled}
    >
      <View style={styles.action}>
        {loading ? (
          <ActivityIndicator style={styles.actionIcon} />
        ) : (
          <Icon
            icon={icon}
            size={fontSizes.xl}
            style={styles.actionIcon}
            color={colors.secondary[600]}
          />
        )}
        <Text>{label}</Text>
      </View>
    </TouchableHighlight>
  );
};
const createStyles = ({ colors, fontSizes, spacing }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    sliderContentContainer: {
      alignItems: 'center',
    },
    page: {
      width: windowDimensions.width - PAGE_MARGIN * 2,
      height: (windowDimensions.width - PAGE_MARGIN * 2) * 1.42,
      marginHorizontal: PAGE_MARGIN,
      backgroundColor: '#ffffff',
      padding: 10,
    },
    pageImage: {
      flexGrow: 1,
    },
    dotsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: spacing[3],
    },
    dot: {
      marginHorizontal: spacing[1],
    },
    actionsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    actionHighlight: {
      flexGrow: 1,
      flexBasis: 0,
      paddingVertical: spacing[3],
    },
    action: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIcon: {
      marginBottom: spacing[2],
    },
  });
