# Storage & downloads – centralized modules

All interaction with the filesystem, downloads and SAF (custom path) goes through `core/storage/`.

## Download flow and destination path

- **Download destination**
  - **Internal** storage: base path = `PUBLIC_APP_DIRECTORY_PATH` (on Android = **externalDirectory**, e.g. `Android/data/it.polito.students/files`; on iOS = documentDirectory). Files go under `.../username/Courses/...`.
  - **Custom** storage (SAF): downloads go to **staging** (`cacheDirectory/username/Courses/...`) and are then moved to SAF without creating anything in documentDirectory.
- **If the user chose "custom"**
  - Base path for downloads = `getCoursesStagingPath(username)` (cache). After download, `moveDownloadToCustomStorage()` copies the file into the SAF folder and removes the cache copy; the app documents folder is not used.

react-native-fs always writes to local file paths (`file://`). To write to a SAF folder you use the APIs in `saf.ts`: after downloading to staging/documents, copy into SAF with `copyFileToSafDirectory`.

## `fileSystem.ts`

Single wrapper over **react-native-fs** for:

- **Paths**
  - `documentDirectory`, `cacheDirectory`, `externalDirectory` (on Android = Android/data/<package>/files; used as the “internal” root for courses)
- **Info**
  - `getInfoAsync`, `pathExists`
- **Directories**
  - `readDirectoryAsync`, `readDirectoryWithInfo`
- **Directory creation**
  - `makeDirectoryAsync`
- **Copy/delete**
  - `copyAsync(from, to)`, `deleteAsync(path, options?)` (options: `ignoreNotFound?: boolean`)
- **String read/write** (e.g. Base64)
  - `readAsStringAsync`, `writeAsStringAsync`, `EncodingType`
- **Checksum**
  - `calculateFileChecksum` (SHA1, for post-download verification and sync)
- **HTTP download**
  - `createResumableDownload(uri, fileUri, options?, callback?)` – resumable with `downloadAsync()` and `cancelAsync()`; types `DownloadResumable`, `DownloadProgressData`

Use this module instead of importing `react-native-fs` directly. Used for downloads by: `DownloadsProvider`, `useDownloadFile`.

## Context (useDownloadsContext)

**DownloadsProvider** exposes storage/path APIs in the context so that components don’t need to import `storageLocation` or `saf` directly:

- **Path**
  - `getCoursesCachePath()`
  - `getCourseFolderPath(courseId, courseName?)`
  - `getCourseFilePath({ courseId, courseName?, location?, fileId, fileName, mimeType? })`
- **Storage**
  - `getFileSizeInStorage(filePath)`, `fileExistsInStorage(filePath)`
  - `openFile(filePath)`, `removeFileFromStorage(filePath)`, `deleteLocalPath(path)`
  - `pickStorageFolder()`
- **Post-download / sync**
  - `persistDownloadedFile(localPath, { id, ctx, ctxId })`
  - `syncLocalFilesToDb()` (sync local files into the DB on app start)
- **Badge and size refresh**
  - `cacheSizeVersion` – number to use as a dependency when re-running getTotalSize/getTotalSizeByContext and when re-checking badges from the DB
  - `refreshCacheVersion()` – call after removing files and updating the DB so file and folder badges update without leaving the screen

## `saf.ts` (SAF – Android only)

**Low-level** APIs for the Storage Access Framework (**react-native-saf-x**):

- `pickSafDirectory()` – user picks a folder (`openDocumentTree`)
- `copyFileToSafDirectory`, `copyFileFromSafDirectory`
- `fileExistsInSafDirectory`, `deleteFileFromSafDirectory`
- `getSafContentUriForFile`

## `storageLocation.ts` (internal vs custom)

**App-level** logic for where files live (internal vs custom):

- **Preferences**
  - `getCustomStoragePrefs()`
- **Paths**
  - `getCoursesRootPath(username)` = PUBLIC_APP_DIRECTORY_PATH/username/Courses (on Android = externalDirectory, e.g. Android/data/it.polito.students/files; on iOS = documentDirectory)
  - `getCoursesStagingPath(username)` = cacheDirectory/username/Courses (used as the download base when storage is custom)
- **After download**
  - `moveDownloadToCustomStorage(localPath, mime)` – if custom, copies to SAF and updates DB (supports both documentDirectory and cache/staging paths)
- **Post-download persistence**
  - `persistDownloadedFileToDb(...)` – getInfo, checksum, insertFile, moveDownloadToCustomStorage, updateFile; exposed from the context as `persistDownloadedFile`; used by DownloadsProvider (queue) and useDownloadFile
- **Existence/size**
  - `fileExistsInStorage()`, `getFileSizeInStorage()`
- **Open/remove**
  - `ensureFileLocal()`, `getUriForOpening()`, `removeFileFromStorage()`, `cleanupLocalCopy()`, `localPathExists`, `deleteLocalPath` (opening a file for the user goes through the context: `openFile(filePath)` uses `ensureFileLocal` + file-viewer internally)
- **Sync**
  - `syncLocalFilesToDb(username, fileStorageLocation?)` – inserts missing files into the DB; exposed from the context as `syncLocalFilesToDb()` (username/prefs from the Provider); used by AppContent on startup

## Rules

- For filesystem, download, and storage (internal/custom): import from `core/storage/` (e.g. `fileSystem.ts`, `storageLocation.ts`, `saf.ts`).
- The download queue lives in `core/providers/downloads/` (single module `downloadsQueue.ts`: types, state, reducers, useQueueManagement). Path/storage logic for the queue is in **DownloadsProvider**, which uses `storageLocation` and `saf`.
