declare module 'react-native-mime-types' {
  function extension(type: string): string;
  function lookup(path: string): string | false;
}

declare module 'react-native-path' {
  function dirname(path: string): string;
}

declare module 'react-native-file-viewer' {
  function open(path: string): Promise<void>;
}
