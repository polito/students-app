import { Configuration, DefaultConfig } from '@polito/api-client/runtime';

import { join } from 'path';

import { setup } from './setup';
import { config as baseConfig } from './wdio.shared.local.conf';

DefaultConfig.config = new Configuration({ accessToken: process.env.TOKEN! });

const timeout: number = 1000000;

function generateTestPath(stringPath: string) {
  const path = stringPath.split('/');
  const filename = 'android.spec.' + path.pop() + '.ts';
  return join('..', 'tests', 'specs', ...path, filename);
}

const config = {
  ...baseConfig,

  specs: [
    '../tests/specs/android.spec.login.ts',
    /*
    "../tests/specs/android.spec.place.ts",
    "../tests/specs/android.spec.lectures.ts",

    //TEACHING
    "../tests/specs/teaching_page/android.spec.course.ts",
    "../tests/specs/teaching_page/android.spec.book_exam.ts",
    "../tests/specs/teaching_page/android.spec.assignment.ts",

    //SERVICES
    "../tests/specs/services_page/android.spec.room.ts",
    "../tests/specs/services_page/android.spec.ticket.ts",
    "../tests/specs/services_page/android.spec.job_offering.ts",
    "../tests/specs/services_page/android.spec.degree.ts",
    */
  ],
  exclude: [],
  capabilities: [
    {
      platformName: 'Android',
      maxInstances: 1,
      /* eslint-disable */
      'appium:udid': 'emulator-5554',
      'appium:automationName': 'UiAutomator2',
      'appium:app': './apps/app-release.apk',
      'appium:noReset': true,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
      'appium:language': setup.language === 'en' ? 'en' : 'it',
      'appium:locale': setup.language === 'en' ? 'US' : 'IT',
      // avd
      'appium:avdLaunchTimeout': timeout,
      'appium:avdReadyTimeout': timeout,
      // driver/server
      'appium:uiautomator2ServerLaunchTimeout': timeout,
      'appium:uiautomator2ServerInstallTimeout': timeout,
      'appium:disableWindowAnimation': false,
      // app
      'appium:appWaitForLaunch': true,
      'appium:appWaitDuration': timeout,
      // other
      'appium:timeZone': 'Europe/Rome',
      // alternative setTimeZone with adb https://stackoverflow.com/questions/8062827/how-do-i-change-timezone-using-adb
      /* eslint-enable */
    },
  ],
};

const defaultTests = [
  'place',
  'lectures',
  'teaching_page/course',
  'teaching_page/book_exam',
  'teaching_page/assignment',
  'services_page/room',
  'services_page/ticket',
  'services_page/job_offering',
  'services_page/degree',
];

const testsToRun = process.env.TESTS?.trim()
  ? process.env.TESTS.trim().split(/\s+/)
  : defaultTests;

config.specs.push(...testsToRun.map(generateTestPath));

export { config };
