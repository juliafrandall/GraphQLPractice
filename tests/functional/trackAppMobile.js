'use strict';

define([
  'node_modules/intern/browser_modules/dojo/node!fs',
  'intern',
  'intern!object',
  'intern/chai!assert',
  '../support/pages/TrackAppPage'
], function(fs, intern, registerSuite, assert, TrackAppPage) {
  registerSuite(function() {
    var trackAppPage;

    var config = { // TODO: create a config module which will be imported in Page Objects instead of pass it as parameter to it
      baseUrl: intern.args.base_url,
      width: 480,
      height: 768,
      maxTimeout: 900000,
      maxFindTimeout: 60000,
      maxSleepTime: 3500,
      mobileDevice: true
    };

    var counter = -1;
    var path = '/src/tests/screenshots/'; // TODO: use a relative path

    fs.exists('test-results-meta.json', function(exists) {
      if (exists) {
        fs.unlink('test-results-meta.json', function(err) {
          if (err) {
            // console.log('ERROR: ', err);
          }
        });
      } else {
        // Add some code here!
      }
    });

    return {
      setup: function() {
        trackAppPage = new TrackAppPage(this.remote);
      },

      beforeEach: function() {
        counter++;
        this.timeout = config.maxTimeout;
        this.parent._timeout = 45000;
        console.log('Browser: ', this.parent.name);

        if (this.parent.name.indexOf('internet explorer') >= 0) {
          config.skip = true;
        }
        if (this.parent.name.indexOf('iphone') >= 0) {
          config.mobileDevice = true;
        } else {
          config.mobileDevice = false;
        }
      },

      afterEach: function() {
        var finishedTest = this.tests.filter(function(i) {
          return i.timeElapsed != null
        });
        var currentTest = finishedTest[finishedTest.length - 1];

        this.remote
          .getCurrentUrl()
          .then(function(url) {
            var test = {};

            fs.exists('test-results-meta.json', function(exists) {
              function updateMeta() {
                test[currentTest.id] = {
                  lastURL: url
                };

                fs.writeFile('test-results-meta.json', JSON.stringify(test), function(err) {
                  if (err) {
                    console.log('ERROR: ' + err);
                  }
                });
              }

              if (exists) {
                fs.readFile('test-results-meta.json', function(err, data) {
                  if (!err) {
                    try {
                      test = JSON.parse(data);
                      updateMeta();
                    } catch (err) {
                      console.log('ERROR: ' + err);
                    }
                  } else {
                    console.log('ERROR: ' + err);
                  }
                });
              } else {
                updateMeta();
              }
            });
          })

        var currentTest = this.tests[counter];
        if (!currentTest.error) {
          return;
        }
        this.remote
          .takeScreenshot()
          .then(function(buffer) {
            console.log('takenScreenshot');
            if (!fs.existsSync(path)) {
              fs.mkdirSync(path);
              console.log('created: ' + path);
            }
            fs.writeFileSync(path + currentTest.name + '_' + counter + '.png', buffer);
          });
      },


      /**
       * Login
       */
      'User sign up & sign in': function() {
        if (config.mobileDevice != true) {
          this.skip('mobile-only test');
        } else {
          return trackAppPage
            .userLoginMobile(config)
            .then(function(bool) {
              assert.isTrue(bool,
                'Login should be navigable');
            });
        }
      },


      /**
       * Save Preferences
       */
      // 'Save preferences': function() {
      //   if (config.mobileDevice != true) {
      //     this.skip('mobile-only test');
      //   } else {
      //     return trackAppPage
      //       .savePreferencesMobile(config)
      //       .then(function(bool) {
      //         assert.isTrue(bool,
      //           'Login should be navigable');
      //       });
      //   }
      // },


      /**
       * Log Food
       */
      'Food logging': function() {
        if (config.mobileDevice != true) {
          this.skip('mobile-only test');
        } else {
          return trackAppPage
            .logFoodMobile(config)
            .then(function(bool) {
              assert.isTrue(bool,
                'Login should be navigable');
            });
        }
      },


      /**
       * Log Weight
       */
      'Weight logging': function() {
        if (config.mobileDevice != true) {
          this.skip('desktop-only test');
        } else {
          return trackAppPage
            .logWeightMobile(config)
            .then(function(bool) {
              assert.isTrue(bool,
                'Weight Login forms should be navigable');
            });
        }
      },
    };
  });
});
