/* eslint-disable */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@lib': './lib',
            '@core': './src/core',
            '@features': './src/features',
            '@utils': './src/utils',
          },
        },
      ],
      ['module:react-native-dotenv'],
    ],
  };
};
