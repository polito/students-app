import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  faCloudArrowDown,
  faSearch,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { Row } from '@lib/ui/components/Row';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import {
  DownloadContext,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useDownloadQueue } from '../../../core/hooks/useDownloadQueue';
import { useHideTabs } from '../../../core/hooks/useHideTabs';
import { getFileKey } from '../../../core/providers/downloads/downloadsQueue';
import {
  getFlattenedCourseFiles,
  useGetCourse,
  useGetCourseDirectory,
  useGetCourseFiles,
  useGetCourseFilesRecent,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import {
  CourseDirectoryContentWithLocations,
  CourseFileOverviewWithLocation,
} from '../../../core/types/files';
import { formatDateTime } from '../../../utils/dates';
import {
  buildCourseFileUrl,
  formatFileSize,
  stripIdInParentheses,
} from '../../../utils/files';
import { useFileManagement } from '../hooks/useFileManagement';
import type { CourseSharedScreensParamList } from '../navigation/CourseSharedScreens';
import { isDirectory } from '../utils/fs-entry';

type Props = NativeStackScreenProps<
  CourseSharedScreensParamList,
  'CourseFileMultiSelect'
>;

function getDirectorySubtitle(
  dir: CourseDirectory,
  courseFilesTree: CourseDirectoryContentWithLocations[] | undefined,
  t: (key: string, opts?: { count?: number }) => string,
): string {
  if (!courseFilesTree) return '';
  const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
  const recursiveFileCount = files.length;
  const totalSizeInKiloBytes = files.reduce(
    (sum, f) => sum + (f.sizeInKiloBytes ?? 0),
    0,
  );
  const folderCount = dir.files.filter(isDirectory).length;
  const countParts: string[] = [];
  if (recursiveFileCount > 0) {
    countParts.push(
      t('courseDirectoryListItem.fileCount', { count: recursiveFileCount }),
    );
  }
  if (folderCount > 0) {
    countParts.push(
      t('courseDirectoryListItem.folderCount', { count: folderCount }),
    );
  }
  const countText = countParts.join(', ');
  const sizeText =
    totalSizeInKiloBytes > 0 ? formatFileSize(totalSizeInKiloBytes) : '';
  if (countText && sizeText) return `${countText} - ${sizeText}`;
  return countText || sizeText || t('courseDirectoryListItem.empty');
}

export const CourseFileMultiSelectScreen = ({ route, navigation }: Props) => {
  const { courseId, mode, directoryId } = route.params;
  const { t } = useTranslation();
  const { getCourseFilePath, cacheSizeVersion, updateDownload } =
    useDownloadsContext();
  const { data: course } = useGetCourse(courseId);
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const courseFilesQuery = useGetCourseFiles(courseId);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const { width: windowWidth } = useWindowDimensions();
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);

  // Hide bottom tab bar (Android needs explicit hide; iOS hides automatically for modal)
  useHideTabs();

  // --- Data source based on mode ---

  const data = useMemo(() => {
    if (mode === 'directory') return directoryQuery.data ?? undefined;
    return recentFilesQuery.data ?? undefined;
  }, [mode, directoryQuery.data, recentFilesQuery.data]);

  // --- File management (sorting, download/remove actions) ---

  const {
    setEnableMultiSelect,
    sortedData,
    handleDownloadAction,
    handleRemoveAction,
    removeButtonTitle,
    isRemoveButtonDisabled,
    downloadButtonStyle,
    removeButtonStyle,
    isDownloading,
    downloadButtonProgress,
  } = useFileManagement({
    courseId,
    data,
    isDirectoryView: mode === 'directory',
  });

  // --- Download queue (shared via context) ---

  const { addFiles, removeFiles, contextFiles, downloads, clearFiles } =
    useDownloadQueue(courseId, DownloadContext.Course);

  // --- Flat file list and tree for selection ---

  const flatFileList = useMemo((): CourseFileOverviewWithLocation[] => {
    if (mode === 'directory' && courseFilesQuery.data) {
      return getFlattenedCourseFiles(courseFilesQuery.data, directoryId);
    }
    return recentFilesQuery.data ?? [];
  }, [mode, courseFilesQuery.data, directoryId, recentFilesQuery.data]);

  const courseFilesTree =
    mode === 'directory' ? courseFilesQuery.data : undefined;

  const displayItems = useMemo(() => sortedData ?? [], [sortedData]);

  // --- Local state ---

  const [searchFilter, setSearchFilter] = useState('');
  const [downloadedFileIdsFromDb, setDownloadedFileIdsFromDb] = useState<
    Set<string>
  >(new Set());
  const closingForActionRef = useRef(false);

  // --- Mount: enable multi-select and clear queue ---

  useEffect(() => {
    setEnableMultiSelect(true);
    clearFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Cleanup on close (X / swipe), NOT on action-driven goBack ---

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!closingForActionRef.current) {
        clearFiles();
      }
    });
    return unsubscribe;
  }, [navigation, clearFiles]);

  // --- Load downloaded file IDs from DB ---

  useEffect(() => {
    if (courseId == null) return;
    const fileDatabase = getFileDatabase();
    fileDatabase
      .getFilesByContext(DownloadContext.Course, String(courseId))
      .then(files => setDownloadedFileIdsFromDb(new Set(files.map(f => f.id))))
      .catch(() => setDownloadedFileIdsFromDb(new Set()));
  }, [courseId, cacheSizeVersion]);

  // --- Selection state ---

  const selectedFileIds = useMemo(
    () => new Set(contextFiles.map(f => f.id)),
    [contextFiles],
  );

  const allFilesSelected = useMemo(
    () =>
      flatFileList.length > 0 &&
      flatFileList.every(f => selectedFileIds.has(f.id)),
    [flatFileList, selectedFileIds],
  );

  // --- Filtered list ---

  const listData = useMemo(() => {
    if (!searchFilter.trim()) return displayItems;
    const q = searchFilter.trim().toLowerCase();
    return displayItems.filter(item => {
      if (isDirectory(item)) {
        return (item as CourseDirectory).name.toLowerCase().includes(q);
      }
      const file = item as CourseFileOverviewWithLocation;
      return (file.name ?? '').toLowerCase().includes(q);
    });
  }, [displayItems, searchFilter]);

  // --- Helpers ---

  const getFileDownloadKey = useCallback(
    (file: CourseFileOverviewWithLocation) => {
      const url = buildCourseFileUrl(courseId, file.id);
      const path = getCourseFilePath({
        courseId,
        courseName: course?.name,
        location: file.location,
        fileId: file.id,
        fileName: file.name ?? '',
        mimeType: file.mimeType,
      });
      return getFileKey({
        id: file.id,
        name: file.name ?? '',
        request: {
          ctx: DownloadContext.Course,
          ctxId: String(courseId),
          source: url,
          destination: path,
        },
        contextId: courseId,
        contextType: DownloadContext.Course,
      });
    },
    [courseId, course?.name, getCourseFilePath],
  );

  // --- Selection count ---

  const totalSelectedCount = useMemo(
    () => flatFileList.filter(f => selectedFileIds.has(f.id)).length,
    [flatFileList, selectedFileIds],
  );

  // --- Button state ---

  const modalDownloadButtonTitle = useMemo(() => {
    if (isDownloading) {
      return t('common.download');
    }
    return totalSelectedCount > 0
      ? `${t('common.download')} (${totalSelectedCount})`
      : t('common.download');
  }, [isDownloading, totalSelectedCount, t]);

  const isModalDownloadButtonDisabled = totalSelectedCount === 0;

  const modalCtaTextStyle = useMemo(
    () => (windowWidth < 400 ? { fontSize: fontSizes.sm } : undefined),
    [windowWidth, fontSizes.sm],
  );

  // --- Directory helpers ---

  const isDirectoryFullySelected = useCallback(
    (dir: CourseDirectory) => {
      if (!courseFilesTree) return false;
      const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
      return files.length > 0 && files.every(f => selectedFileIds.has(f.id));
    },
    [courseFilesTree, selectedFileIds],
  );

  const isDirectoryFullyDownloaded = useCallback(
    (dir: CourseDirectory) => {
      if (!courseFilesTree) return false;
      const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
      return (
        files.length > 0 && files.every(f => downloadedFileIdsFromDb.has(f.id))
      );
    },
    [courseFilesTree, downloadedFileIdsFromDb],
  );

  // --- Toggle handlers ---

  const handleToggleFile = useCallback(
    (file: CourseFileOverviewWithLocation) => {
      if (selectedFileIds.has(file.id)) {
        removeFiles([file.id]);
      } else {
        addFiles([
          {
            id: file.id,
            name: file.name ?? '',
            url: buildCourseFileUrl(courseId, file.id),
            filePath: getCourseFilePath({
              courseId,
              courseName: course?.name,
              location: file.location,
              fileId: file.id,
              fileName: file.name ?? '',
              mimeType: file.mimeType,
            }),
            sizeInKiloBytes: file.sizeInKiloBytes,
          },
        ]);
      }
    },
    [
      selectedFileIds,
      addFiles,
      removeFiles,
      courseId,
      course?.name,
      getCourseFilePath,
    ],
  );

  const handleToggleDirectory = useCallback(
    (dir: CourseDirectory) => {
      if (!courseFilesTree) return;
      const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
      const allSelected = files.every(f => selectedFileIds.has(f.id));
      if (allSelected) {
        removeFiles(files.map(f => f.id));
      } else {
        addFiles(
          files.map(f => ({
            id: f.id,
            name: f.name ?? '',
            url: buildCourseFileUrl(courseId, f.id),
            filePath: getCourseFilePath({
              courseId,
              courseName: course?.name,
              location: f.location,
              fileId: f.id,
              fileName: f.name ?? '',
              mimeType: f.mimeType,
            }),
            sizeInKiloBytes: f.sizeInKiloBytes,
          })),
        );
      }
    },
    [
      courseFilesTree,
      selectedFileIds,
      addFiles,
      removeFiles,
      courseId,
      course?.name,
      getCourseFilePath,
    ],
  );

  const handleToggleSelectAll = useCallback(() => {
    if (allFilesSelected) {
      removeFiles(flatFileList.map(f => f.id));
    } else {
      addFiles(
        flatFileList.map(f => ({
          id: f.id,
          name: f.name ?? '',
          url: buildCourseFileUrl(courseId, f.id),
          filePath: getCourseFilePath({
            courseId,
            courseName: course?.name,
            location: f.location,
            fileId: f.id,
            fileName: f.name ?? '',
            mimeType: f.mimeType,
          }),
          sizeInKiloBytes: f.sizeInKiloBytes,
        })),
      );
    }
  }, [
    allFilesSelected,
    flatFileList,
    addFiles,
    removeFiles,
    courseId,
    course?.name,
    getCourseFilePath,
  ]);

  // --- Download press ---

  const handleDownloadPress = useCallback(() => {
    // Reset download state for any already-downloaded files so they get re-downloaded
    flatFileList.forEach(f => {
      if (selectedFileIds.has(f.id) && downloadedFileIdsFromDb.has(f.id)) {
        const key = getFileDownloadKey(f);
        updateDownload(key, {
          isDownloaded: false,
          downloadProgress: undefined,
          jobId: undefined,
        });
      }
    });
    closingForActionRef.current = true;
    handleDownloadAction();
    navigation.goBack();
  }, [
    flatFileList,
    selectedFileIds,
    downloadedFileIdsFromDb,
    getFileDownloadKey,
    updateDownload,
    handleDownloadAction,
    navigation,
  ]);

  // --- Remove press ---

  const handleRemovePress = useCallback(() => {
    handleRemoveAction(() => {
      closingForActionRef.current = true;
      navigation.goBack();
    });
  }, [handleRemoveAction, navigation]);

  // --- Render ---

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TextButton onPress={handleToggleSelectAll}>
          {allFilesSelected ? t('common.deselectAll') : t('common.selectAll')}
        </TextButton>
      </View>

      <View style={styles.searchBarWrap}>
        <Row align="center" style={styles.searchBar}>
          <TranslucentTextField
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
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={listData}
          extraData={{ downloads, downloadedFileIdsFromDb }}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={Platform.select({
            ios: IndentedDivider,
          })}
          renderItem={({ item }) => {
            if (isDirectory(item)) {
              const dir = item as CourseDirectory;
              const isSelected = courseFilesTree
                ? isDirectoryFullySelected(dir)
                : false;
              return (
                <DirectoryListItem
                  title={dir.name}
                  subtitle={getDirectorySubtitle(dir, courseFilesTree, t)}
                  isDownloaded={
                    courseFilesTree ? isDirectoryFullyDownloaded(dir) : false
                  }
                  trailingItem={
                    courseFilesTree ? (
                      <Checkbox
                        isChecked={isSelected}
                        onPress={() => handleToggleDirectory(dir)}
                        textStyle={styles.checkboxTrailingText}
                        containerStyle={styles.checkboxTrailingContainer}
                      />
                    ) : undefined
                  }
                  onPress={() => courseFilesTree && handleToggleDirectory(dir)}
                />
              );
            }
            const file = item as CourseFileOverviewWithLocation;
            const isSelected = selectedFileIds.has(file.id);
            const downloadKey = getFileDownloadKey(file);
            const downloadState = downloads[downloadKey];
            const isDownloaded = downloadedFileIdsFromDb.has(file.id);
            const downloadProgress = downloadState?.downloadProgress;
            const fileSubtitle = [
              file.createdAt &&
                formatDateTime(
                  file.createdAt instanceof Date
                    ? file.createdAt
                    : new Date(file.createdAt),
                ),
              formatFileSize(file.sizeInKiloBytes ?? 0),
            ]
              .filter(Boolean)
              .join(' - ');
            return (
              <FileListItem
                title={
                  stripIdInParentheses(file.name ?? '') ||
                  t('common.unnamedFile')
                }
                subtitle={fileSubtitle}
                mimeType={file.mimeType}
                isDownloaded={isDownloaded}
                downloadProgress={downloadProgress}
                trailingItem={
                  <Checkbox
                    isChecked={isSelected}
                    onPress={() => handleToggleFile(file)}
                    textStyle={styles.checkboxTrailingText}
                    containerStyle={styles.checkboxTrailingContainer}
                  />
                }
                onPress={() => handleToggleFile(file)}
              />
            );
          }}
        />

        <View style={styles.ctaRow}>
          <CtaButton
            title={modalDownloadButtonTitle}
            icon={faCloudArrowDown}
            action={handleDownloadPress}
            disabled={isModalDownloadButtonDisabled}
            absolute={false}
            variant="filled"
            style={downloadButtonStyle}
            progress={downloadButtonProgress}
            containerStyle={styles.ctaButtonContainer}
            textStyle={modalCtaTextStyle}
          />
          <CtaButton
            title={removeButtonTitle}
            icon={faTrash}
            action={handleRemovePress}
            style={[removeButtonStyle, styles.ctaButton]}
            disabled={isRemoveButtonDisabled}
            absolute={false}
            destructive={true}
            containerStyle={styles.ctaButtonContainer}
            textStyle={modalCtaTextStyle}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = ({ colors, shapes, spacing }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      alignItems: 'flex-end',
    },
    searchBarWrap: {
      overflow: 'hidden',
      paddingHorizontal: spacing[4],
    },
    searchBar: {
      paddingBottom: spacing[2],
    },
    keyboardAvoiding: {
      flex: 1,
      minHeight: 0,
    },
    textField: {
      borderRadius: shapes.lg,
    },
    list: {
      flex: 1,
      minHeight: 0,
    },
    listContent: {
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[20],
    },
    ctaRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'stretch',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
    ctaButtonContainer: {},
    ctaButton: {
      marginBottom: 0,
    },
    checkboxTrailingText: {
      marginHorizontal: 0,
    },
    checkboxTrailingContainer: {
      marginHorizontal: 0,
      marginVertical: 0,
    },
  });
