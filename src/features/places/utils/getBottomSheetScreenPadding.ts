import { Dimensions } from 'react-native';

const SIDE_PADDING = 20;

/**
 * Computes MapBox camera padding for a places screen based on the header,
 * bottom bar and initial bottom sheet heights
 */
export const getBottomSheetScreenPadding = ({
  headerHeight,
  tabBarHeight,
  initialBottomSheetHeightRatio,
}: {
  headerHeight: number;
  tabBarHeight: number;
  initialBottomSheetHeightRatio: number;
}) => ({
  paddingTop: headerHeight,
  paddingLeft: SIDE_PADDING,
  paddingRight: SIDE_PADDING,
  paddingBottom:
    (Dimensions.get('window').height - headerHeight - tabBarHeight) *
      initialBottomSheetHeightRatio +
    tabBarHeight,
});
