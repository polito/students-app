import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

import { Checkbox } from '~/core/components/Checkbox';

import { BottomModal } from '../../../core/components/BottomModal';
import { DownloadContext } from '../../../core/contexts/DownloadsContext';
import { useDownloadQueue } from '../../../core/hooks/useDownloadQueue';
import { getFileKey } from '../../../core/providers/downloads/downloadsFileUtils';
import { getFlattenedCourseFiles } from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import {
  CourseDirectoryContentWithLocations,
  CourseFileOverviewWithLocation,
} from '../../../core/types/files';
import { formatDateTime } from '../../../utils/dates';
import {
  buildCourseFilePath,
  buildCourseFileUrl,
  formatFileSize,
} from '../../../utils/files';
import { isDirectory } from '../utils/fs-entry';

export type DirectoryOrFile = CourseDirectory | CourseFileOverviewWithLocation;

export interface CourseFileMultiSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onCloseModalOnly?: () => void;
  onModalHide?: (reason?: 'download' | 'remove') => void;
  courseId: number;
  courseFilesCache: string;
  flatFileList: CourseFileOverviewWithLocation[];
  displayItems?: DirectoryOrFile[];
  courseFilesTree?: CourseDirectoryContentWithLocations[];
  handleDownloadAction: () => void;
  handleRemoveAction: (onConfirmed?: () => void) => void;
  removeButtonTitle: string;
  isRemoveButtonDisabled: boolean;
  downloadButtonTitle?: string;
  isDownloadButtonDisabled?: boolean;
  isDownloading?: boolean;
  downloadButtonProgress?: number;
  downloadButtonStyle?: { backgroundColor: string; borderColor: string };
  removeButtonStyle: {
    backgroundColor: string;
    borderColor: string;
    marginBottom?: number;
  };
}

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

export const CourseFileMultiSelectModal = ({
  visible,
  onClose,
  onCloseModalOnly,
  onModalHide,
  courseId,
  courseFilesCache,
  flatFileList,
  displayItems,
  courseFilesTree,
  handleDownloadAction,
  handleRemoveAction,
  removeButtonTitle,
  isRemoveButtonDisabled,
  removeButtonStyle,
  downloadButtonTitle,
  isDownloadButtonDisabled,
  isDownloading,
  downloadButtonProgress,
  downloadButtonStyle,
}: CourseFileMultiSelectModalProps) => {
  const { t } = useTranslation();
  const [searchFilter, setSearchFilter] = useState('');
  const closingForActionRef = useRef<'download' | 'remove' | false>(false);
  const { height: windowHeight } = useWindowDimensions();
  const { top: safeAreaTop } = useSafeAreaInsets();
  const { spacing } = useTheme();
  const styles = useStylesheet(createStyles);

  const { addFiles, removeFiles, contextFiles, downloads } = useDownloadQueue(
    courseId,
    DownloadContext.Course,
  );

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

  const listData = useMemo(() => {
    const source = displayItems ?? flatFileList;
    if (!searchFilter.trim()) return source;
    const q = searchFilter.trim().toLowerCase();
    return source.filter(item => {
      if (isDirectory(item)) {
        return (item as CourseDirectory).name.toLowerCase().includes(q);
      }
      const file = item as CourseFileOverviewWithLocation;
      return (file.name ?? '').toLowerCase().includes(q);
    });
  }, [displayItems, flatFileList, searchFilter]);

  const getFileDownloadKey = useCallback(
    (file: CourseFileOverviewWithLocation) => {
      const url = buildCourseFileUrl(courseId, file.id);
      const path = buildCourseFilePath(
        courseFilesCache,
        file.location,
        file.id,
        file.name ?? '',
        file.mimeType,
      );
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
    [courseId, courseFilesCache],
  );

  const notDownloadedSelectedCount = useMemo(() => {
    return flatFileList.filter(f => {
      const key = getFileDownloadKey(f);
      const isDownloaded = downloads[key]?.isDownloaded === true;
      return selectedFileIds.has(f.id) && !isDownloaded;
    }).length;
  }, [flatFileList, selectedFileIds, downloads, getFileDownloadKey]);

  const modalDownloadButtonTitle = useMemo(() => {
    if (isDownloading && downloadButtonTitle) {
      return downloadButtonTitle;
    }
    return notDownloadedSelectedCount > 0
      ? `${t('common.download')} (${notDownloadedSelectedCount})`
      : t('common.download');
  }, [isDownloading, notDownloadedSelectedCount, downloadButtonTitle, t]);

  const isModalDownloadButtonDisabled =
    (isDownloadButtonDisabled ?? false) || notDownloadedSelectedCount === 0;

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
        files.length > 0 &&
        files.every(f => {
          const key = getFileDownloadKey(f);
          return downloads[key]?.isDownloaded === true;
        })
      );
    },
    [courseFilesTree, downloads, getFileDownloadKey],
  );

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
            filePath: buildCourseFilePath(
              courseFilesCache,
              file.location,
              file.id,
              file.name ?? '',
              file.mimeType,
            ),
            sizeInKiloBytes: file.sizeInKiloBytes,
          },
        ]);
      }
    },
    [selectedFileIds, addFiles, removeFiles, courseId, courseFilesCache],
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
            filePath: buildCourseFilePath(
              courseFilesCache,
              f.location,
              f.id,
              f.name ?? '',
              f.mimeType,
            ),
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
      courseFilesCache,
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
          filePath: buildCourseFilePath(
            courseFilesCache,
            f.location,
            f.id,
            f.name ?? '',
            f.mimeType,
          ),
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
    courseFilesCache,
  ]);

  const handleDownloadPress = useCallback(() => {
    closingForActionRef.current = 'download';
    onCloseModalOnly?.();
    handleDownloadAction();
  }, [onCloseModalOnly, handleDownloadAction]);

  const handleRemovePress = useCallback(() => {
    handleRemoveAction(() => {
      closingForActionRef.current = 'remove';
      onCloseModalOnly?.();
    });
  }, [onCloseModalOnly, handleRemoveAction]);

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      dismissable={true}
      onModalHide={() => {
        setSearchFilter('');
        const reason =
          closingForActionRef.current !== false
            ? closingForActionRef.current
            : undefined;
        closingForActionRef.current = false;
        onModalHide?.(reason);
      }}
    >
      <View
        style={[
          styles.modalContent,
          {
            height: windowHeight - spacing[12],
            paddingTop: safeAreaTop,
          },
        ]}
      >
        <Row align="center" justify="space-between" style={styles.header}>
          <TextButton onPress={onClose}>{t('common.done')}</TextButton>
          <TextButton onPress={handleToggleSelectAll}>
            {allFilesSelected ? t('common.deselectAll') : t('common.selectAll')}
          </TextButton>
        </Row>

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

        <FlatList
          data={listData}
          extraData={downloads}
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
                        textStyle={{ marginHorizontal: 0 }}
                        containerStyle={{
                          marginHorizontal: 0,
                          marginVertical: 0,
                        }}
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
            const isDownloaded = !!downloadState?.isDownloaded;
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
                title={file.name ?? t('common.unnamedFile')}
                subtitle={fileSubtitle}
                mimeType={file.mimeType}
                isDownloaded={isDownloaded}
                downloadProgress={downloadProgress}
                trailingItem={
                  <Checkbox
                    isChecked={isSelected}
                    onPress={() => handleToggleFile(file)}
                    textStyle={{ marginHorizontal: 0 }}
                    containerStyle={{
                      marginHorizontal: 0,
                      marginVertical: 0,
                    }}
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
          />
          <CtaButton
            title={removeButtonTitle}
            icon={faTrash}
            action={handleRemovePress}
            style={removeButtonStyle}
            disabled={isRemoveButtonDisabled}
            absolute={false}
            destructive={true}
          />
        </View>
      </View>
    </BottomModal>
  );
};

const createStyles = ({ colors, shapes, spacing }: Theme) =>
  StyleSheet.create({
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: shapes.lg,
      borderTopRightRadius: shapes.lg,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: spacing[4],
    },
    searchBarWrap: {
      overflow: 'hidden',
      paddingHorizontal: spacing[4],
    },
    searchBar: {
      paddingBottom: spacing[2],
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
    },
    ctaRow: {
      flexDirection: 'row',
      gap: spacing[4],
      paddingHorizontal: spacing[6],
      //backgroundColor: colors.background,
    },
  });
