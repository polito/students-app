export const formatFileSize = (
  sizeInKiloBytes: number,
  fractionDigit: number = 2,
) => {
  if (sizeInKiloBytes < 1000) {
    return `${sizeInKiloBytes.toFixed(fractionDigit)} KB`;
  }
  if (sizeInKiloBytes < 1000000) {
    return `${Math.round(sizeInKiloBytes / 1000)} MB`;
  }
  return `${Math.round(sizeInKiloBytes / 1000000)} GB`;
};

export const splitNameAndExtension = (filePath?: string) => {
  const [_, name, extension] = filePath?.match(/(.+)\.(.+)$/) ?? [];
  return [name, extension] as [string | null, string | null];
};
