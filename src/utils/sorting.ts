/**
 * Generic sorting utilities for the application
 */

/**
 * Sort items alphabetically by name (A-Z)
 */
export const sortByNameAsc = <T extends { name: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );
};

/**
 * Sort items alphabetically by name (Z-A)
 */
export const sortByNameDesc = <T extends { name: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) =>
    b.name.toLowerCase().localeCompare(a.name.toLowerCase()),
  );
};

/**
 * Sort items by date (newest first)
 */
export const sortByDateDesc = <T extends { createdAt: Date }>(
  items: T[],
): T[] => {
  return [...items].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
};

/**
 * Sort items by date (oldest first)
 */
export const sortByDateAsc = <T extends { createdAt: Date }>(
  items: T[],
): T[] => {
  return [...items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
};

/**
 * Sort items by updated date (newest first)
 */
export const sortByUpdatedDesc = <T extends { updatedAt: Date }>(
  items: T[],
): T[] => {
  return [...items].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
};

/**
 * Sort items by updated date (oldest first)
 */
export const sortByUpdatedAsc = <T extends { updatedAt: Date }>(
  items: T[],
): T[] => {
  return [...items].sort(
    (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
  );
};

/**
 * Sort items by a boolean property (true values first)
 */
export const sortByBooleanDesc = <T>(
  items: T[],
  getBoolean: (item: T) => boolean,
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = getBoolean(a);
    const bValue = getBoolean(b);
    if (aValue === bValue) return 0;
    return aValue ? -1 : 1;
  });
};

/**
 * Sort items by a boolean property (false values first)
 */
export const sortByBooleanAsc = <T>(
  items: T[],
  getBoolean: (item: T) => boolean,
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = getBoolean(a);
    const bValue = getBoolean(b);
    if (aValue === bValue) return 0;
    return aValue ? 1 : -1;
  });
};

/**
 * Sort items with directories first, then by a custom sort function
 */
export const sortWithDirectoriesFirst = <T extends { type: string }>(
  items: T[],
  sortFunction: (a: T, b: T) => number,
): T[] => {
  return [...items].sort((a, b) => {
    // Directories always come first
    if (a.type === 'directory' && b.type === 'directory') return 0;
    if (a.type === 'directory') return -1;
    if (b.type === 'directory') return 1;

    // Apply custom sort function for non-directories
    return sortFunction(a, b);
  });
};

/**
 * Sort items with directories first, then by name (A-Z)
 */
export const sortWithDirectoriesFirstByName = <
  T extends { type: string; name: string },
>(
  items: T[],
): T[] => {
  return sortWithDirectoriesFirst(items, (a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );
};

/**
 * Sort items with directories first, then by date (newest first)
 * Only files are sorted by date, directories maintain their relative order
 */
export const sortWithDirectoriesFirstByDate = <T extends { type: string }>(
  items: T[],
  getCreatedAt: (item: T) => Date,
): T[] => {
  return sortWithDirectoriesFirst(items, (a, b) => {
    const dateA = getCreatedAt(a);
    const dateB = getCreatedAt(b);
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Sort items with directories first, then by download status (downloaded first)
 */
export const sortWithDirectoriesFirstByDownloadStatus = <
  T extends { type: string; name: string; id: string },
  D extends Record<string, { isDownloaded: boolean }>,
>(
  items: T[],
  downloads: D,
  getDownloadKey: (item: T) => string,
): T[] => {
  return sortWithDirectoriesFirst(items, (a, b) => {
    const aKey = getDownloadKey(a);
    const bKey = getDownloadKey(b);
    const aDownloaded = downloads[aKey]?.isDownloaded ?? false;
    const bDownloaded = downloads[bKey]?.isDownloaded ?? false;

    if (aDownloaded === bDownloaded) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }
    // Not downloaded files first (false values first)
    return aDownloaded ? 1 : -1;
  });
};
