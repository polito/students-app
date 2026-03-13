import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
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
  faEllipsisVertical,
  faSearch,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { Row } from '@lib/ui/components/Row';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseDirectory } from '@polito/api-client';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Checkbox } from '~/core/components/Checkbox';

import {
  DownloadContext,
  useDownloadsContext,
} from '../../../core/contexts/DownloadsContext';
import { getFileDatabase } from '../../../core/database/FileDatabase';
import { useDownloadQueue } from '../../../core/hooks/useDownloadQueue';
import { useHideTabs } from '../../../core/hooks/useHideTabs';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
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
import { MENU_ACTIONS } from '../constants';
import { useFileManagement } from '../hooks/useFileManagement';
import type { CourseSharedScreensParamList } from '../navigation/CourseSharedScreens';
import { isDirectory } from '../utils/fs-entry';

const FileRow = React.memo(
  ({
    file,
    isSelected,
    isDownloaded,
    downloadProgress,
    onToggle,
    checkboxTrailingTextStyle,
    checkboxTrailingContainerStyle,
    t,
  }: {
    file: CourseFileOverviewWithLocation;
    isSelected: boolean;
    isDownloaded: boolean;
    downloadProgress: number | undefined;
    onToggle: (file: CourseFileOverviewWithLocation) => void;
    checkboxTrailingTextStyle: any;
    checkboxTrailingContainerStyle: any;
    t: (key: string) => string;
  }) => {
    const handlePress = useCallback(() => onToggle(file), [onToggle, file]);
    const fileSubtitle = useMemo(
      () =>
        [
          file.createdAt &&
            formatDateTime(
              file.createdAt instanceof Date
                ? file.createdAt
                : new Date(file.createdAt),
            ),
          formatFileSize(file.sizeInKiloBytes ?? 0),
        ]
          .filter(Boolean)
          .join(' - '),
      [file.createdAt, file.sizeInKiloBytes],
    );
    const title = useMemo(
      () => stripIdInParentheses(file.name ?? '') || t('common.unnamedFile'),
      [file.name, t],
    );

    return (
      <FileListItem
        title={title}
        subtitle={fileSubtitle}
        mimeType={file.mimeType}
        isDownloaded={isDownloaded}
        downloadProgress={downloadProgress}
        trailingItem={
          <Checkbox
            isChecked={isSelected}
            onPress={handlePress}
            textStyle={checkboxTrailingTextStyle}
            containerStyle={checkboxTrailingContainerStyle}
          />
        }
        onPress={handlePress}
      />
    );
  },
);

const DirectoryRow = React.memo(
  ({
    dir,
    subtitle,
    isSelected,
    isDownloaded,
    hasTree,
    onToggle,
    checkboxTrailingTextStyle,
    checkboxTrailingContainerStyle,
  }: {
    dir: CourseDirectory;
    subtitle: string;
    isSelected: boolean;
    isDownloaded: boolean;
    hasTree: boolean;
    onToggle: (dir: CourseDirectory) => void;
    checkboxTrailingTextStyle: any;
    checkboxTrailingContainerStyle: any;
  }) => {
    const handlePress = useCallback(() => onToggle(dir), [onToggle, dir]);

    return (
      <DirectoryListItem
        title={dir.name}
        subtitle={subtitle}
        isDownloaded={isDownloaded}
        trailingItem={
          hasTree ? (
            <Checkbox
              isChecked={isSelected}
              onPress={handlePress}
              textStyle={checkboxTrailingTextStyle}
              containerStyle={checkboxTrailingContainerStyle}
            />
          ) : undefined
        }
        onPress={handlePress}
      />
    );
  },
);

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
  const {
    getCourseFilePath,
    cacheSizeVersion,
    updateDownload,
    removeFileFromStorage,
    setRemovalInProgress,
    refreshCacheVersion,
  } = useDownloadsContext();
  const { data: course } = useGetCourse(courseId);
  const directoryQuery = useGetCourseDirectory(courseId, directoryId);
  const courseFilesQuery = useGetCourseFiles(courseId);
  const recentFilesQuery = useGetCourseFilesRecent(courseId);
  const { width: windowWidth } = useWindowDimensions();
  const { fontSizes, palettes, colors, spacing } = useTheme();
  const { paddingHorizontal } = useSafeAreaSpacing();
  const styles = useStylesheet(createStyles);

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
    isDownloading,
    downloadButtonProgress,
  } = useFileManagement({
    courseId,
    data,
    isDirectoryView: mode === 'directory',
  });

  // --- Download queue (shared via context) ---

  const { addFilesAndStart, downloads, clearFiles, removeFiles } =
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

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    () => new Set(),
  );

  const allFilesSelected =
    flatFileList.length > 0 &&
    flatFileList.every(f => selectedFileIds.has(f.id));

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

  const selectedDownloadedCount = useMemo(
    () =>
      flatFileList.filter(
        f => selectedFileIds.has(f.id) && downloadedFileIdsFromDb.has(f.id),
      ).length,
    [flatFileList, selectedFileIds, downloadedFileIdsFromDb],
  );

  const modalDownloadButtonTitle = useMemo(() => {
    if (isDownloading) {
      return t('common.download');
    }
    return totalSelectedCount > 0
      ? `${t('common.download')} (${totalSelectedCount})`
      : t('common.download');
  }, [isDownloading, totalSelectedCount, t]);

  const isModalDownloadButtonDisabled = totalSelectedCount === 0;

  const modalRemoveButtonTitle = useMemo(
    () =>
      selectedDownloadedCount > 0
        ? `${t('common.remove')} (${selectedDownloadedCount})`
        : t('common.remove'),
    [selectedDownloadedCount, t],
  );

  const isModalRemoveButtonDisabled = selectedDownloadedCount === 0;

  const modalDownloadButtonStyle = useMemo(
    () =>
      totalSelectedCount === 0
        ? {
            backgroundColor: colors.secondaryText,
            borderColor: colors.secondaryText,
          }
        : {
            backgroundColor: palettes.primary[400],
            borderColor: palettes.primary[400],
          },
    [totalSelectedCount, colors.secondaryText, palettes.primary],
  );

  const modalRemoveButtonStyle = useMemo(
    () =>
      selectedDownloadedCount === 0
        ? {
            backgroundColor: colors.secondaryText,
            borderColor: colors.secondaryText,
            marginBottom: spacing[16],
          }
        : {
            backgroundColor: palettes.danger[600],
            borderColor: palettes.danger[600],
            marginBottom: spacing[16],
          },
    [selectedDownloadedCount, colors.secondaryText, palettes.danger, spacing],
  );

  const modalCtaTextStyle = useMemo(
    () => (windowWidth < 400 ? { fontSize: fontSizes.sm } : undefined),
    [windowWidth, fontSizes.sm],
  );

  const handleToggleFile = useCallback(
    (file: CourseFileOverviewWithLocation) => {
      setSelectedFileIds(prev => {
        const next = new Set(prev);
        if (next.has(file.id)) next.delete(file.id);
        else next.add(file.id);
        return next;
      });
    },
    [],
  );

  const handleToggleDirectory = useCallback(
    (dir: CourseDirectory) => {
      if (!courseFilesTree) return;
      const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
      setSelectedFileIds(prev => {
        const allIn = files.every(f => prev.has(f.id));
        const next = new Set(prev);
        if (allIn) files.forEach(f => next.delete(f.id));
        else files.forEach(f => next.add(f.id));
        return next;
      });
    },
    [courseFilesTree],
  );

  const handleToggleSelectAll = useCallback(() => {
    setSelectedFileIds(prev => {
      if (flatFileList.length > 0 && prev.size === flatFileList.length) {
        return new Set();
      }
      return new Set(flatFileList.map(f => f.id));
    });
  }, [flatFileList]);

  const keyExtractor = useCallback(
    (item: CourseDirectoryContentWithLocations) => item.id,
    [],
  );

  const directoryMetadataMap = useMemo(() => {
    if (!courseFilesTree)
      return new Map<
        string,
        { subtitle: string; isDownloaded: boolean; fileIds: string[] }
      >();
    const map = new Map<
      string,
      { subtitle: string; isDownloaded: boolean; fileIds: string[] }
    >();
    for (const item of displayItems) {
      if (isDirectory(item)) {
        const dir = item as CourseDirectory;
        const files = getFlattenedCourseFiles(courseFilesTree, dir.id);
        map.set(dir.id, {
          subtitle: getDirectorySubtitle(dir, courseFilesTree, t),
          isDownloaded:
            files.length > 0 &&
            files.every(f => downloadedFileIdsFromDb.has(f.id)),
          fileIds: files.map(f => f.id),
        });
      }
    }
    return map;
  }, [courseFilesTree, displayItems, downloadedFileIdsFromDb, t]);

  const fileDownloadProgressMap = useMemo(() => {
    const map = new Map<string, number | undefined>();
    for (const item of displayItems) {
      if (!isDirectory(item)) {
        const file = item as CourseFileOverviewWithLocation;
        const downloadKey = getFileDownloadKey(file);
        map.set(file.id, downloads[downloadKey]?.downloadProgress);
      }
    }
    return map;
  }, [displayItems, downloads, getFileDownloadKey]);

  const extraData = useMemo(
    () => ({
      selectedFileIds,
      downloadedFileIdsFromDb,
      directoryMetadataMap,
      fileDownloadProgressMap,
    }),
    [
      selectedFileIds,
      downloadedFileIdsFromDb,
      directoryMetadataMap,
      fileDownloadProgressMap,
    ],
  );

  const renderItem = useCallback(
    ({ item }: { item: CourseDirectoryContentWithLocations }) => {
      if (isDirectory(item)) {
        const dir = item as CourseDirectory;
        const meta = directoryMetadataMap.get(dir.id);
        const isSelected =
          (meta?.fileIds.length ?? 0) > 0 &&
          (meta?.fileIds.every(id => selectedFileIds.has(id)) ?? false);
        return (
          <DirectoryRow
            dir={dir}
            subtitle={meta?.subtitle ?? ''}
            isSelected={isSelected}
            isDownloaded={meta?.isDownloaded ?? false}
            hasTree={!!courseFilesTree}
            onToggle={handleToggleDirectory}
            checkboxTrailingTextStyle={styles.checkboxTrailingText}
            checkboxTrailingContainerStyle={styles.checkboxTrailingContainer}
          />
        );
      }
      const file = item as CourseFileOverviewWithLocation;
      return (
        <FileRow
          file={file}
          isSelected={selectedFileIds.has(file.id)}
          isDownloaded={downloadedFileIdsFromDb.has(file.id)}
          downloadProgress={fileDownloadProgressMap.get(file.id)}
          onToggle={handleToggleFile}
          checkboxTrailingTextStyle={styles.checkboxTrailingText}
          checkboxTrailingContainerStyle={styles.checkboxTrailingContainer}
          t={t}
        />
      );
    },
    [
      directoryMetadataMap,
      courseFilesTree,
      handleToggleDirectory,
      selectedFileIds,
      downloadedFileIdsFromDb,
      fileDownloadProgressMap,
      handleToggleFile,
      styles.checkboxTrailingText,
      styles.checkboxTrailingContainer,
      t,
    ],
  );

  const handleDownloadPress = useCallback(() => {
    const toAdd = flatFileList.filter(f => selectedFileIds.has(f.id));
    if (toAdd.length === 0) return;

    const alreadyDownloadedCount = toAdd.filter(f =>
      downloadedFileIdsFromDb.has(f.id),
    ).length;

    const doDownload = () => {
      const filesForQueue = toAdd.map(f => ({
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
      }));

      addFilesAndStart(filesForQueue);

      toAdd.forEach(f => {
        if (downloadedFileIdsFromDb.has(f.id)) {
          const key = getFileDownloadKey(f);
          updateDownload(key, {
            isDownloaded: false,
            downloadProgress: undefined,
            jobId: undefined,
          });
        }
      });

      closingForActionRef.current = true;
      navigation.goBack();
    };

    if (alreadyDownloadedCount > 0) {
      const newCount = toAdd.length - alreadyDownloadedCount;
      const message = t('courseFilesTab.updateDownloadedInfoMessage', {
        downloadedCount: alreadyDownloadedCount,
        newCount,
      });
      Alert.alert(t('courseFilesTab.updateDownloadedInfoTitle'), message, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.ok'), onPress: doDownload },
      ]);
      return;
    }

    doDownload();
  }, [
    flatFileList,
    selectedFileIds,
    downloadedFileIdsFromDb,
    courseId,
    course?.name,
    getCourseFilePath,
    getFileDownloadKey,
    addFilesAndStart,
    updateDownload,
    navigation,
    t,
  ]);

  const handleRemovePress = useCallback(() => {
    const toRemove = flatFileList.filter(
      f => selectedFileIds.has(f.id) && downloadedFileIdsFromDb.has(f.id),
    );
    if (toRemove.length === 0) return;

    const fileCount = toRemove.length;
    const message =
      fileCount === 1
        ? t('courseFilesTab.removeFileConfirmation')
        : t('courseFilesTab.removeFilesConfirmation', { count: fileCount });

    Alert.alert(t('courseFilesTab.removeFilesTitle'), message, [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('common.yes'),
        onPress: async () => {
          closingForActionRef.current = true;
          navigation.goBack();
          setRemovalInProgress(true);
          const fileDatabase = getFileDatabase();
          try {
            const ctx = DownloadContext.Course;
            const ctxId = String(courseId);
            const filesFromDb = await fileDatabase.getFilesByContext(
              ctx,
              ctxId,
            );
            const dbFilesById = new Map(filesFromDb.map(f => [f.id, f]));

            const removePromises = toRemove.map(async f => {
              const filePath =
                dbFilesById.get(f.id)?.path ??
                getCourseFilePath({
                  courseId,
                  courseName: course?.name,
                  location: f.location,
                  fileId: f.id,
                  fileName: f.name ?? '',
                  mimeType: f.mimeType,
                });
              try {
                await removeFileFromStorage(filePath);
              } catch (err) {
                console.error(`Error removing file ${filePath}:`, err);
              }
              try {
                await fileDatabase.deleteFile(f.id);
              } catch (err) {
                console.error(`Error deleting file metadata ${f.id}:`, err);
              }
              const key = getFileDownloadKey(f);
              updateDownload(key, {
                jobId: undefined,
                isDownloaded: false,
                downloadProgress: undefined,
              });
            });

            await Promise.all(removePromises);
            refreshCacheVersion();
            removeFiles(toRemove.map(f => f.id));
          } finally {
            setRemovalInProgress(false);
          }
        },
      },
    ]);
  }, [
    flatFileList,
    selectedFileIds,
    downloadedFileIdsFromDb,
    courseId,
    course?.name,
    getCourseFilePath,
    getFileDownloadKey,
    removeFileFromStorage,
    updateDownload,
    refreshCacheVersion,
    removeFiles,
    setRemovalInProgress,
    navigation,
    t,
  ]);

  // --- Render ---

  const headerMenuActions = useMemo(
    () => [
      {
        id: MENU_ACTIONS.SELECT_ALL,
        title: allFilesSelected
          ? t('common.deselectAll')
          : t('common.selectAll'),
      },
    ],
    [allFilesSelected, t],
  );

  const onHeaderMenuAction = useCallback(
    ({ nativeEvent: { event } }: NativeActionEvent) => {
      if (event === MENU_ACTIONS.SELECT_ALL) {
        handleToggleSelectAll();
      }
    },
    [handleToggleSelectAll],
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    navigation.setOptions({
      headerRight: () => (
        <MenuView
          actions={headerMenuActions}
          onPressAction={onHeaderMenuAction}
        >
          <View style={styles.ellipsisTrigger}>
            <Icon
              icon={faEllipsisVertical}
              color={palettes.primary[400]}
              size={fontSizes.lg}
            />
          </View>
        </MenuView>
      ),
    });
  }, [
    navigation,
    headerMenuActions,
    onHeaderMenuAction,
    palettes.primary,
    fontSizes.lg,
    styles.ellipsisTrigger,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {Platform.OS === 'ios' ? (
        <View style={styles.header}>
          <TextButton onPress={() => navigation.goBack()}>
            {t('common.close')}
          </TextButton>
          <View style={styles.headerRight}>
            <TextButton onPress={handleToggleSelectAll}>
              {allFilesSelected
                ? t('common.deselectAll')
                : t('common.selectAll')}
            </TextButton>
          </View>
        </View>
      ) : null}

      <View style={[styles.searchBarWrap, paddingHorizontal]}>
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
          data={listData as CourseDirectoryContentWithLocations[]}
          extraData={extraData}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={[styles.listContent, paddingHorizontal]}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ItemSeparatorComponent={Platform.select({
            ios: IndentedDivider,
          })}
          renderItem={renderItem}
        />

        <View style={styles.ctaRow}>
          <CtaButton
            title={modalDownloadButtonTitle}
            icon={faCloudArrowDown}
            action={handleDownloadPress}
            disabled={isModalDownloadButtonDisabled}
            absolute={false}
            variant="filled"
            style={modalDownloadButtonStyle}
            progress={downloadButtonProgress}
            containerStyle={styles.ctaButtonContainer}
            textStyle={modalCtaTextStyle}
          />
          <CtaButton
            title={modalRemoveButtonTitle}
            icon={faTrash}
            action={handleRemovePress}
            style={[modalRemoveButtonStyle, styles.ctaButton]}
            disabled={isModalRemoveButtonDisabled}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[2],
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    ellipsisTrigger: {
      padding: spacing[3],
      marginHorizontal: -spacing[3],
    },
    searchBarWrap: {
      overflow: 'hidden',
      paddingTop: spacing[3],
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
      paddingBottom: spacing[20],
    },
    ctaRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'stretch',
      paddingHorizontal: 18,
      paddingVertical: spacing[2],
      gap: 8,
    },
    ctaButtonContainer: {
      flex: 1,
    },
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
