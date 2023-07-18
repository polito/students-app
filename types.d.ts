declare module 'react-native-mime-types' {
  function extension(type: string): string;
}

declare module 'react-native-path' {
  function dirname(path: string): string;
}

declare module 'react-native-file-viewer' {
  function open(path: string): Promise<void>;
}
