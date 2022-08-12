import * as Constants from 'expo-constants';
import { BASE_PATH, Configuration } from '@polito-it/api-client';

export const apiBasePath = (() => {
  if (process.env.NODE_ENV === 'development') {
    const ipRegex = /exp:\/\/(.*):[0-9]*/g;
    const ipAddress = ipRegex.exec(Constants.default.linkingUri)[1];

    const apiHost = `http://${ipAddress}:4010`;
    console.log(
      `Expecting a running (fake) API on your computer at ${apiHost}`,
    );
    return apiHost;
  }
  return BASE_PATH;
})();

export function getApiConfiguration(): Configuration {
  return new Configuration({
    basePath: apiBasePath,
    accessToken: 'whatever',
  });
}
