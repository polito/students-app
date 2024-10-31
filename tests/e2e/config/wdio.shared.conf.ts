import { exec } from 'child_process';

const debug = false;
const timeout = 60 * 1000;

export const config: WebdriverIO.Config = {
  runner: 'local',
  maxInstances: 1,

  capabilities: [],
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent

  logLevel: 'debug',

  // Timeout globale per la ricerca degli elementi in millisecondi
  waitforTimeout: timeout,

  connectionRetryTimeout: timeout,
  connectionRetryCount: 1,
  services: [],

  execArgv: debug ? ['--inspect'] : [],
  //
  // Framework you want to run your specs with.
  // The following are supported: 'mocha', 'jasmine', and 'cucumber'
  // See also: https://webdriver.io/docs/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed before running any tests.
  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: debug ? 24 * 60 * 60 * 1000 : timeout, // 1d : timeout
    retries: 0, // Max number of retries
    // bail: true, //Stop test after first failure.
  },
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // See also: https://webdriver.io/docs/dot-reporter.html , and click on "Reporters" in left column

  reporters: [
    [
      'spec',
      {
        addConsoleLogs: true,
      },
    ],
  ],
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides a several hooks you can use to interfere the test process in order to enhance
  // it and build services around it. You can either apply a single function to it or an array of
  // methods. If one of them returns with a promise, WebdriverIO will wait until that promise is
  // resolved to continue.
  //
  /**
   * Gets executed once before all workers get launched.
   *
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: async function (_config, _capabilities) {
    // clear all data from app => logout (this option don't work if app is NOT installed, so don't activate in github action => useless and cause error)
    if (process.env.LOCAL === 'true') {
      const logout = `adb shell pm clear ${process.env.PACKAGE_NAME!}`;
      await commandExecution(logout);
    }
  },
  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   *
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {object} specs    specs to be run in the worker process
   * @param  {object} args     object that will be merged with the main configuration once worker is initialized
   * @param  {object} execArgv list of string arguments passed to the worker process
   */
  onWorkerStart: async function (_cid, _caps, _specs, _args, _execArgv) {},
  /**
   * Gets executed before initializing the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   *
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: async function (_config, _capabilities, _specs) {},
  /**
   * Gets executed before the suite starts (in Mocha/Jasmine only).
   *
   * @param {object} suite suite details
   */

  beforeSuite: async function (_suite) {},

  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   *
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {object}         browser      instance of created browser/device session
   */
  before: async function (_capabilities, specs, _browser) {
    // set all permission
    if (specs.length === 1 && specs[0].includes('login')) {
      await driver.executeScript('mobile:changePermissions', [
        {
          permissions: 'all',
          appPackage: process.env.PACKAGE_NAME!,
          action: 'grant',
        },
      ]);
    }
  },

  /**
   * Function to be executed after a test (in Mocha/Jasmine only)
   *
   * @param {object}  test             test object
   * @param {object}  context          scope object the test was executed with
   * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
   * @param {*}       result.result    return object of test function
   * @param {number}  result.duration  duration of test
   * @param {boolean} result.passed    true if test has passed, otherwise false
   * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
   */

  afterTest: async function (test, _context, result) {
    // ADD ERROR IMAGE FOR TEST REPORT
    if (result.error) {
      await takeScreenshot();
    }
  },

  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   *
   * @param {number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: async function (_result, _capabilities, _specs) {
    await driver.terminateApp(process.env.PACKAGE_NAME!);
  },
  /**
   * Gets executed right after terminating the webdriver session.
   *
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {},
  /**
   * Gets executed after all workers have shut down and the process is about to exit.
   * An error thrown in the `onComplete` hook will result in the test run failing.
   *
   * @param {object} exitCode 0 - success, 1 - fail
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  onComplete: async function (exitCode, _config, _capabilities, _results) {
    // Create one single file html for report with allure report
    if (process.env.LOCAL === 'true') {
      const commandAllure =
        'allure generate allure-results --clean --single-file';
      await commandExecution(commandAllure);
    }

    // ADD ERROR IMAGE FOR TEST REPORT
    if (exitCode === 1) {
      await takeScreenshot();
    }
  },
};

async function takeScreenshot() {
  const now = Date.now();
  const filename = `./screenshots/${now}.png`;
  await driver.saveScreenshot(filename);
}

async function commandExecution(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command execution error: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      resolve(stdout);
    });
  });
}
// add allure reporter only in LOCAL execution (HTML REPORT)

process.env.LOCAL === 'true'
  ? config.reporters?.push([
      'allure',
      {
        outputDir: `./allure-results`,
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        addConsoleLogs: true,
      },
    ])
  : config.reporters?.push([
      'ctrf-json',
      {
        outputDir: 'report',
      },
    ]);
