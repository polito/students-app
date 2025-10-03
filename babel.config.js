module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@lib': './lib',
            '~': './src',
          },
        },
      ],
      'module:react-native-dotenv',
      'react-native-reanimated/plugin',
    ],
  };
};
