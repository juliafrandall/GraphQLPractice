'use strict';

// Learn more about configuring this file at <https://theintern.github.io/intern/#configuration>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites
define({
  // Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
  // specified browser environments in the `environments` array below as well. See
  // <https://theintern.github.io/intern/#option-capabilities> for links to the different capabilities options for
  // different services.
  //
  // Note that the `build` capability will be filled in with the current commit ID or build tag from the CI
  // environment automatically
  capabilities: {
    'browserstack.selenium_version': '2.45.0',
    'browserstack.debug': 'true'
  },

  // Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
  // OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
  // capabilities options specified for an environment will be copied as-is
  environments: [
    {
      browserName: 'chrome',
      platform: 'MAC',
      os: 'OS X',
      os_version: 'El Capitan'
    },
    {
      browserName: 'iphone',
      device: 'iPhone 6 plus',
      platform: 'ios'
    },
    // {
    //   browserName: 'internet explorer',
    //   browser_version: '11',
    //   resolution: '1280x800',
    //   platform: 'WIN8'
    // },
  ],


  // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
  maxConcurrency: 5,

  // Name of the tunnel class to use for WebDriver tests.
  // See <https://theintern.github.io/intern/#option-tunnel> for built-in options
  tunnel: 'BrowserStackTunnel',
  tunnelOptions: {
    username: 'rohm',
    accessKey: '9LyWuES7p4h5hB8IjHUT',
    protocol: "https",
    port: 443,
  },

  // Configuration options for the module loader; any AMD configuration options supported by the AMD loader in use
  // can be used here.
  // If you want to use a different loader than the default loader, see
  // <https://theintern.github.io/intern/#option-useLoader> for instruction
  loaderOptions: {
    // Packages that should be registered with the loader in each testing environment
    packages: [{
      name: 'myPackage',
      location: '.'
    }]
  },

  // Non-functional test suite(s) to run in each browser
  suites: [ /* 'myPackage/tests/foo', 'myPackage/tests/bar' */ ],


  // Functional test suite(s) to execute against each browser once non-functional tests are completed
  functionalSuites: [
    'tests/functional/index',
    'tests/functional/indexMobile',
    'tests/functional/trackApp',
    // 'tests/functional/trackAppMobile'
  ],


  // A regular expression matching URLs to files that should not be included in code coverage analysis
  excludeInstrumentation: /^(?:tests|node_modules)\//
});
