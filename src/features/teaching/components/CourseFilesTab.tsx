import { useTranslation } from 'react-i18next';
import { FlatList, TouchableHighlight, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@lib/ui/components/Card';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { FlatListItem } from '../../../core/components/FlatListItem';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseFiles } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

const numColumns = 2;

export const CourseFilesTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const filesQuery = useGetCourseFiles(courseId);

  return (
    <FlatList
      style={[{ flex: 1, paddingHorizontal: spacing[2] }, bottomBarAwareStyles]}
      keyExtractor={item => item.id}
      data={filesQuery.data?.data}
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={createRefreshControl(filesQuery)}
      renderItem={({ item: f, index }) => (
        <FlatListItem
          gap={+spacing[5]}
          numColumns={2}
          itemsCount={filesQuery.data?.data?.length}
          index={index}
        >
          <TouchableHighlight>
            <Card style={{ padding: spacing[5] }}>
              <Ionicons
                name={
                  f.type === 'directory' ? 'folder-outline' : 'document-outline'
                }
                size={36}
                color={colors.secondaryText}
                style={{ alignSelf: 'center', margin: spacing[8] }}
              />
              <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
                {f.name}
              </Text>
              <Text variant="secondaryText">
                {f.files?.length != null
                  ? `${f.files?.length} ${t('Files')}`
                  : `${f.sizeInKiloBytes} KB`}
              </Text>
            </Card>
          </TouchableHighlight>
        </FlatListItem>
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing[5] }} />}
      numColumns={numColumns}
    />
  );
};
