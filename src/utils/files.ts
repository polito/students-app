export const formatFileSize = (sizeInKiloBytes: number) => {
  if (sizeInKiloBytes < 1000) return `${sizeInKiloBytes} KB`;
  if (sizeInKiloBytes < 1000000)
    return `${Math.round(sizeInKiloBytes / 1000)} MB`;
  return `${Math.round(sizeInKiloBytes / 1000000)} GB`;
};

export const formatFileDate = (date: Date) => {
  return `${date.toLocaleDateString()} ${date
    .toLocaleTimeString()
    .slice(0, -3)}`;
};
