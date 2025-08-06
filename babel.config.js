/* eslint-disable @typescript-eslint/naming-convention */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
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
