import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import {
  faCloudArrowDown,
  faEllipsisH,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import {
  BASE_PATH,
  CourseDirectory,
  CourseFileOverview,
} from '@polito/api-client';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FileNavigatorID } from '~/core/constants';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useDownloadsContext } from '../../../core/contexts/DownloadsContext';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useDownloadQueue } from '../../../core/hooks/useDownloadQueue';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import {
  useGetCourseDirectory,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { CourseFileOverviewWithLocation } from '../../../core/types/files';
import { splitNameAndExtension } from '../../../utils/files';
import {
  sortByNameAsc,
  sortByNameDesc,
  sortWithDirectoriesFirstByDate,
  sortWithDirectoriesFirstByDownloadStatus,
} from '../../../utils/sorting';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseDirectoryListItem } from '../components/CourseDirectoryListItem';
import { CourseFileListItem } from '../components/CourseFileListItem';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { CourseContext } from '../contexts/CourseContext';
import { CourseFilesCacheContext } from '../contexts/CourseFilesCacheContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';
import { FileStackParamList } from '../navigation/FileNavigator';
import { CourseFilesCacheProvider } from '../providers/CourseFilesCacheProvider';
import { isDirectory } from '../utils/fs-entry';

type Props = NativeStackScreenProps<
  TeachingStackParamList & FileStackParamList,
  'CourseDirectory' | 'DirectoryFiles'
>;

const FileCacheChecker = () => {
  const { refresh } = useContext(CourseFilesCacheContext);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
};

const CourseDirectoryScreenContent = ({ route, navigation }: Props) => {
  const { courseId, directoryId, directoryName } = route.params;
  const { t } = useTranslation();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const { paddingHorizontal } = useSafeAreaSpacing();
  const { updatePreference } = usePreferencesContext();
  const { palettes, fontSizes } = useTheme();
  const {
    downloads,
    downloadQueue,
    clearQueue,
    setDownloadQueue,
    addToQueue,
    removeFromQueue,
  } = useDownloadsContext();
  const { startQueueDownload, stopQueueDownload } = useDownloadQueue();
  const [courseFilesCache] = useCourseFilesCachePath();
  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [hideFolders, setHideFolders] = useState(false);
  const [sortedData, setSortedData] =
    useState<typeof directoryQuery.data>(undefined);

  // Sync sorted data with query data
  useEffect(() => {
    setSortedData(directoryQuery.data);
  }, [directoryQuery.data]);

  const isFileNavigator = useMemo(() => {
    return navigation.getId() === FileNavigatorID;
  }, [navigation]);

  const selectAllFiles = useCallback(() => {
    if (!sortedData) return;

    const files = sortedData.filter(item => !isDirectory(item));

    files.forEach(file => {
      const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${file.id}`;
      const [filename, extension] = splitNameAndExtension(file.name);
      const cachedFilePath = [
        courseFilesCache,
        (file as any).location?.substring(1),
        [filename ? `${filename} (${file.id})` : file.id, extension]
          .filter(Boolean)
          .join('.'),
      ]
        .filter(Boolean)
        .join('/');

      addToQueue({
        id: file.id,
        name: file.name,
        url: fileUrl,
        filePath: cachedFilePath,
        courseId,
      });
    });
  }, [sortedData, addToQueue, courseId, courseFilesCache]);

  const deselectAllFiles = useCallback(() => {
    if (!sortedData) return;

    const files = sortedData.filter(item => !isDirectory(item));
    files.forEach(file => {
      removeFromQueue(file.id);
    });
  }, [sortedData, removeFromQueue]);

  const allFilesSelected = useMemo(() => {
    if (!sortedData) return false;
    const files = sortedData.filter(item => !isDirectory(item));
    return (
      files.length > 0 &&
      files.every(file =>
        downloadQueue.files.some(queuedFile => queuedFile.id === file.id),
      )
    );
  }, [sortedData, downloadQueue.files]);

  useEffect(() => {
    if (!isFileNavigator) {
      navigation.setOptions({
        headerTitle: directoryName ?? t('common.file_plural'),
      });
    }
  }, [directoryName, isFileNavigator, navigation, t]);

  // Auto-exit multi-select mode when downloads are completed
  useEffect(() => {
    if (enableMultiSelect && downloadQueue.hasCompleted) {
      setEnableMultiSelect(false);
    }
  }, [enableMultiSelect, downloadQueue.hasCompleted]);

  const screenOptions = useMemo(
    () => [
      {
        id: 'select',
        title: enableMultiSelect
          ? t('common.cancelSelection')
          : t('common.select'),
      },
      ...(enableMultiSelect
        ? [
            {
              id: 'selectAll',
              title: allFilesSelected
                ? t('common.deselectAll')
                : t('common.selectAll'),
            },
          ]
        : []),
      {
        id: 'toggleFolders',
        title: hideFolders ? t('common.showFolders') : t('common.hideFolders'),
      },
    ],
    [t, enableMultiSelect, allFilesSelected, hideFolders],
  );
  const sortOptions = useMemo(
    () => [
      {
        id: t('common.orderByNameAZ'),
        title: t('common.orderByNameAZ'),
      },
      {
        id: t('common.orderByNameZA'),
        title: t('common.orderByNameZA'),
      },
      {
        id: t('common.downloadStatus.false'),
        title: t('common.downloadStatus.false'),
      },
      {
        id: t('common.newest'),
        title: t('common.newest'),
      },
      {
        id: t('common.oldest'),
        title: t('common.oldest'),
      },
    ],
    [t],
  );
  const [activeSort, setActiveSort] = useState(sortOptions[0].title);
  const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
    // eslint-disable-next-line default-case
    switch (event) {
      case screenOptions[0].id:
        if (enableMultiSelect) {
          // Exit multi-select mode and clear queue
          setEnableMultiSelect(false);
          clearQueue();
        } else {
          // Enter multi-select mode
          setEnableMultiSelect(true);
          // Reset hasCompleted when entering selection mode
          setDownloadQueue(prev => ({
            ...prev,
            hasCompleted: false,
          }));
        }
        break;
      case 'selectAll':
        if (allFilesSelected) {
          deselectAllFiles();
        } else {
          selectAllFiles();
        }
        break;
      case 'toggleFolders':
        setHideFolders(prev => !prev);
        break;
      case screenOptions[3].id:
        break;
    }
  };
  const onPressSortOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
    setActiveSort(event);
    if (!directoryQuery.data) return;

    // eslint-disable-next-line default-case
    switch (event) {
      case sortOptions[0].id: // A-Z
        setSortedData(sortByNameAsc(directoryQuery.data));
        break;
      case sortOptions[1].id: // Z-A
        setSortedData(sortByNameDesc(directoryQuery.data));
        break;
      case sortOptions[2].id: // Download status
        setSortedData(
          sortWithDirectoriesFirstByDownloadStatus(
            directoryQuery.data,
            downloads,
            item => {
              if (item.type === 'directory') return '';
              const fileUrl = `${BASE_PATH}/courses/${courseId}/files/${item.id}`;
              const [filename, extension] = splitNameAndExtension(item.name);
              const cachedFilePath = [
                courseFilesCache,
                (item as any).location?.substring(1),
                [filename ? `${filename} (${item.id})` : item.id, extension]
                  .filter(Boolean)
                  .join('.'),
              ]
                .filter(Boolean)
                .join('/');
              return `${fileUrl}:${cachedFilePath}`;
            },
          ),
        );
        break;
      case sortOptions[3].id: // Newest
        setSortedData(
          sortWithDirectoriesFirstByDate(directoryQuery.data, item =>
            item.type === 'file' ? item.createdAt : new Date(0),
          ),
        );
        break;
      case sortOptions[4].id: // Oldest
        setSortedData(
          sortWithDirectoriesFirstByDate(directoryQuery.data, item =>
            item.type === 'file' ? item.createdAt : new Date(0),
          ).reverse(),
        );
        break;
    }
  };
  return (
    <CourseFilesCacheProvider>
      <FileCacheChecker />

      {isFileNavigator && (
        <CourseSearchBar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      )}
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignSelf: 'stretch',
          flexDirection: 'row',
        }}
      >
        <MenuView
          actions={sortOptions}
          onPressAction={e => {
            onPressSortOption(e);
          }}
        >
          <TextButton>{activeSort}</TextButton>
        </MenuView>
        <MenuView actions={screenOptions} onPressAction={onPressOption}>
          <IconButton
            icon={faEllipsisH}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('common.options')}
          />
        </MenuView>
      </View>

      {searchFilter ? (
        <CourseFileSearchFlatList
          courseId={courseId}
          searchFilter={searchFilter}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={
            hideFolders
              ? sortedData?.filter(item => !isDirectory(item))
              : sortedData
          }
          scrollEnabled={scrollEnabled}
          contentContainerStyle={paddingHorizontal}
          keyExtractor={(item: CourseDirectory | CourseFileOverview) => item.id}
          initialNumToRender={15}
          renderItem={({ item }) =>
            isDirectory(item) ? (
              <CourseDirectoryListItem
                courseId={courseId}
                item={item}
                enableMultiSelect={enableMultiSelect}
              />
            ) : (
              <CourseFileListItem
                item={item}
                onSwipeStart={() => setScrollEnabled(false)}
                onSwipeEnd={() => setScrollEnabled(true)}
                enableMultiSelect={enableMultiSelect}
              />
            )
          }
          refreshControl={<RefreshControl manual queries={[directoryQuery]} />}
          ItemSeparatorComponent={Platform.select({
            ios: IndentedDivider,
          })}
          ListFooterComponent={<BottomBarSpacer />}
          ListEmptyComponent={
            !directoryQuery.isLoading ? (
              <OverviewList
                emptyStateText={
                  isFileNavigator
                    ? t('courseDirectoryScreen.emptyRootFolder')
                    : t('courseDirectoryScreen.emptyFolder')
                }
              />
            ) : null
          }
        />
      )}
      {isFileNavigator && navigation && !enableMultiSelect && (
        <CtaButton
          title={t('courseDirectoryScreen.navigateRecentFiles')}
          icon={faFile}
          action={() => {
            navigation.replace('RecentFiles', { courseId });
            updatePreference('filesScreen', 'filesView');
          }}
        />
      )}
      {navigation && enableMultiSelect && (
        <CtaButton
          title={
            downloadQueue.isDownloading && downloadQueue.files.length > 0
              ? t('courseDirectoryScreen.downloadProgress', {
                  current: Math.min(
                    downloadQueue.currentFileIndex + 1,
                    downloadQueue.files.length,
                  ),
                  total: downloadQueue.files.length,
                })
              : downloadQueue.files.length > 0
                ? `${t('common.download')} (${downloadQueue.files.length})`
                : t('common.download')
          }
          icon={
            downloadQueue.isDownloading && downloadQueue.files.length > 0
              ? faXmark
              : faCloudArrowDown
          }
          action={() => {
            if (downloadQueue.isDownloading && downloadQueue.files.length > 0) {
              stopQueueDownload();
              clearQueue();
            } else if (downloadQueue.files.length > 0) {
              startQueueDownload();
            }
          }}
          progress={
            downloadQueue.isDownloading && downloadQueue.files.length > 0
              ? downloadQueue.overallProgress
              : undefined
          }
          style={{
            backgroundColor: downloadQueue.isDownloading
              ? palettes.danger[600]
              : palettes.primary[400],
            borderColor: downloadQueue.isDownloading
              ? palettes.danger[600]
              : palettes.primary[400],
          }}
        />
      )}
    </CourseFilesCacheProvider>
  );
};

interface SearchFlatListProps {
  courseId: number;
  searchFilter: string;
}

interface SearchBarProps {
  searchFilter: string;
  setSearchFilter: (search: string) => void;
}

const CourseSearchBar = ({ searchFilter, setSearchFilter }: SearchBarProps) => {
  const { paddingHorizontal } = useSafeAreaSpacing();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <Row align="center" style={[paddingHorizontal, styles.searchBar]}>
      <TranslucentTextField
        autoFocus={searchFilter.length !== 0}
        autoCorrect={false}
        leadingIcon={faSearch}
        value={searchFilter}
        onChangeText={setSearchFilter}
        style={[GlobalStyles.grow, styles.textField]}
        label={t('courseDirectoryScreen.search')}
        editable={true}
        isClearable={!!searchFilter}
        onClear={() => setSearchFilter('')}
        onClearLabel={t('contactsScreen.clearSearch')}
      />
    </Row>
  );
};

const CourseFileSearchFlatList = ({
  courseId,
  searchFilter,
}: SearchFlatListProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<
    CourseFileOverviewWithLocation[]
  >([]);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { paddingHorizontal } = useSafeAreaSpacing();

  useEffect(() => {
    if (!recentFilesQuery.data) return;
    setSearchResults(
      recentFilesQuery.data.filter(file =>
        file.name.toLowerCase().includes(searchFilter.toLowerCase()),
      ),
    );
  }, [recentFilesQuery.data, searchFilter]);

  const onSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const onSwipeEnd = useCallback(() => setScrollEnabled(true), []);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={searchResults}
      scrollEnabled={scrollEnabled}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={4}
      contentContainerStyle={paddingHorizontal}
      keyExtractor={(item: CourseFileOverviewWithLocation) => item.id}
      renderItem={({ item }) => (
        <CourseRecentFileListItem
          item={item}
          onSwipeStart={onSwipeStart}
          onSwipeEnd={onSwipeEnd}
        />
      )}
      refreshControl={<RefreshControl manual queries={[recentFilesQuery]} />}
      ItemSeparatorComponent={Platform.select({
        ios: () => <IndentedDivider />,
      })}
      ListEmptyComponent={
        <Text style={styles.noResultText}>
          {t('courseDirectoryScreen.noResult')}
        </Text>
      }
    />
  );
};

const createStyles = ({ spacing, shapes, colors }: Theme) =>
  StyleSheet.create({
    noResultText: {
      padding: spacing[4],
    },
    textField: {
      borderRadius: shapes.lg,
    },
    searchBar: {
      paddingBottom: spacing[2],
      paddingTop: spacing[2],
      backgroundColor: colors.background,
    },
  });

export const CourseDirectoryScreen = ({ route, navigation }: Props) => {
  const { courseId } = route.params;

  return (
    <CourseContext.Provider value={courseId}>
      <CourseDirectoryScreenContent route={route} navigation={navigation} />
    </CourseContext.Provider>
  );
};
