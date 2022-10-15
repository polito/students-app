module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@lib': './lib',
          },
        },
      ],
        ["module:react-native-dotenv"]
    ],
  };
};
