import { Platform } from 'react-native';
import { DocumentDirectoryPath, ExternalDirectoryPath } from 'react-native-fs';

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';
export const MAX_RECENT_SEARCHES = 10;
export const ANDROID_DOCUMENT_DIRECTORY_PATH = '/storage/emulated/0/Documents';
export const PUBLIC_APP_DIRECTORY_PATH = IS_IOS
  ? DocumentDirectoryPath
  : Platform.Version > '29'
    ? ANDROID_DOCUMENT_DIRECTORY_PATH
    : ExternalDirectoryPath;
export const courseColors = [
  { name: 'colors.red', color: '#DC2626' },
  { name: 'colors.orange', color: '#EA580C' },
  { name: 'colors.amber', color: '#D97706' },
  { name: 'colors.yellow', color: '#CA8A04' },
  { name: 'colors.lime', color: '#65A30D' },
  { name: 'colors.green', color: '#16A34A' },
  { name: 'colors.emerald', color: '#059669' },
  { name: 'colors.teal', color: '#0D9488' },
  { name: 'colors.cyan', color: '#0891B2' },
  { name: 'colors.lightBlue', color: '#0284C7' },
  { name: 'colors.blue', color: '#2563EB' },
  { name: 'colors.indigo', color: '#4F46E5' },
  { name: 'colors.violet', color: '#7C3AED' },
  { name: 'colors.purple', color: '#9333EA' },
  { name: 'colors.fuchsia', color: '#C026D3' },
  { name: 'colors.pink', color: '#DB2777' },
  { name: 'colors.rose', color: '#E11D48' },
  { name: 'colors.warmGray', color: '#737373' },
  { name: 'colors.coolGray', color: '#5C778A' },
];
export const GITHUB_URL =
  'https://github.com/polito/students-app/releases/latest';
