const {mergeConfig} = require('@react-native/metro-config');
const {getSentryExpoConfig} = require('@sentry/react-native/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getSentryExpoConfig(__dirname), config);
