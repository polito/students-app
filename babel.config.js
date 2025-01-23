module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      [
        'module-resolver',
        {
          alias: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@lib': './lib',
          },
        },
      ],
      'module:react-native-dotenv',
      'react-native-reanimated/plugin',
    ],
  };
};
