import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TouchableHighlight,
  View,
  useWindowDimensions,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { cleanSingle, openCamera } from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faFileCirclePlus,
  faFileCircleXmark,
  faPrint,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { CarouselDots } from '@lib/ui/components/CarouselDots';
import { Divider } from '@lib/ui/components/Divider';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { displayTabBar, hideTabBar } from '../../../utils/tab-bar';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { pdfSizes } from '../constants';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentPdfCreation'
>;

const A4_ASPECT_RATIO = 1.414;

export const CourseAssignmentPdfCreationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId, firstImageUri } = route.params;

  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const styles = useStylesheet(createStyles);
  const { bottom: marginBottom } = useSafeAreaInsets();
  const [imageUris, setImageUris] = useState<string[]>([firstImageUri]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isCreatingPDF, setIsCreatingPDF] = useState(false);
  const [pageContainerAspectRatio, setPageContainerAspectRatio] = useState(1);
  const pageSliderRef = useRef<FlatList>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    const rootNav = navigation.getParent()!;
    hideTabBar(rootNav);
    return () => displayTabBar(rootNav);
  }, [navigation]);

  const addPage = () => {
    openCamera({
      ...pdfSizes,
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
      includeBase64: true,
    })
      .then(image => {
        setImageUris(oldUris => [...oldUris, image.path]);
        setTimeout(() => pageSliderRef.current?.scrollToEnd());
      })
      .catch(e => {
        console.error(e);
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
          pageSliderRef.current?.scrollToIndex({
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

    const html = `
    <html>
    <head>
      <style>
        html, body {
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
    ${imageUris
      .map(
        uri =>
          `<img style='display: block; width: 1000px; height: 1410px; object-fit: contain; page-break-after: always' src='${uri}'/>`,
      )
      .join('\n')}
    </body>
    </html>
    `;

    RNHTMLtoPDF.convert({
      width: 750,
      height: 1058,
      padding: 0,
      fileName: 'assignment',
      html,
    })
      .then(pdf => {
        navigation.navigate('CourseAssignmentUploadConfirmation', {
          courseId,
          file: {
            uri:
              Platform.select({ android: 'file://', ios: '' }) + pdf.filePath!,
            name: 'assignment.pdf',
            size: 200, // any size - has no effect
            type: 'application/pdf',
          },
        });
      })
      .catch((e: Error) =>
        setFeedback({
          text: t('courseAssignmentPdfCreationScreen.failureFeedback', {
            reason: e.message,
          }),
          isError: true,
        }),
      )
      .finally(() => setIsCreatingPDF(false));
  };

  return (
    <View
      style={[
        styles.screen,
        {
          marginBottom,
        },
      ]}
    >
      <Animated.FlatList
        ref={pageSliderRef}
        data={imageUris}
        horizontal
        pagingEnabled
        keyExtractor={item => item}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          setCurrentPageIndex(Math.max(0, Math.round(x / width)));
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              {
                width,
              },
              styles.pageContainer,
            ]}
            onLayout={({ nativeEvent }) => {
              setPageContainerAspectRatio(
                nativeEvent.layout.height / nativeEvent.layout.width,
              );
            }}
          >
            <View
              style={[
                {
                  ...(pageContainerAspectRatio < A4_ASPECT_RATIO
                    ? { height: '100%' }
                    : { width: '100%' }),
                },
                styles.page,
              ]}
            >
              <Image
                resizeMode="contain"
                source={{ uri: item }}
                style={styles.pageImage}
              />
            </View>
          </View>
        )}
        extraData={imageUris}
      />
      <View style={styles.dotsContainer}>
        <CarouselDots
          carouselLength={imageUris.length ?? 0}
          carouselIndex={currentPageIndex}
          expandedDotsCounts={4}
        />
      </View>

      <Divider />
      <View style={styles.actionsContainer}>
        <Action
          disabled={isCreatingPDF}
          icon={faFileCircleXmark}
          label={t('courseAssignmentPdfCreationScreen.ctaDeletePage')}
          onPress={deletePage}
        />
        <Action
          disabled={isCreatingPDF}
          icon={faFileCirclePlus}
          label={t('courseAssignmentPdfCreationScreen.ctaAddPage')}
          onPress={addPage}
        />
        <Action
          disabled={isCreatingPDF}
          loading={isCreatingPDF}
          icon={faPrint}
          label={t('courseAssignmentPdfCreationScreen.ctaConfirm')}
          onPress={createPdf}
        />
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
  const { colors, palettes, fontSizes } = useTheme();
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
            color={palettes.secondary[600]}
          />
        )}
        <Text>{label}</Text>
      </View>
    </TouchableHighlight>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    pageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    // eslint-disable-next-line react-native/no-color-literals
    page: {
      aspectRatio: 1 / A4_ASPECT_RATIO,
      backgroundColor: 'white',
    },
    pageImage: {
      flexGrow: 1,
    },
    dotsContainer: {
      alignItems: 'center',
      height: 6,
      marginVertical: spacing[4],
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
