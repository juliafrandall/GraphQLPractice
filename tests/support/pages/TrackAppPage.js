'use strict';

define(['require', 'node_modules/moment/moment', 'intern/chai!assert'], function(require, moment, assert) {
  function TrackAppPage(remote) {
    this.remote = remote;
  }

  TrackAppPage.prototype = {
    constructor: TrackAppPage,

    'userLogin': function(config) {
      /**
       * Fake contextual data
       */
      // User Credentials
      var date = moment().format('YYYYMMDDHHmmss');
      var NAME = 'Tester' + date;
      var EMAIL = 'tester' + date + '@nutritionix.com';
      var PASSWORD = 'tester';
      // End

      return this.remote
        .get(require.toUrl(config.baseUrl + '/login'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)


      /**
       * Create User
       */
      .findByCssSelector('a[ui-sref="account.auth.create.step1"]')
        .click()
        .end()

      // Type Name
      .findByCssSelector('input#firstName')
        .type(NAME)
        .end()

      // Type Email
      .findByCssSelector('input#email')
        .type(EMAIL)
        .end()

      // Type Email Repeat
      .findByCssSelector('input#emailRepeat')
        .type(EMAIL)
        .end()

      // Type Password
      .findByCssSelector('input#password')
        .type(PASSWORD)
        .end()

      // Click on Confirmation Checkbox
      .findByCssSelector('input[ng-model="vm.confirm.track"]')
        .click()
        .end()

      // Click on Confirmation Button
      .findByCssSelector('.btn')
        .click()
        .end()

      .sleep(config.maxSleepTime)
      // Type Username
      .findByCssSelector('input#username')
        .type(NAME)
        .end()

      .findByCssSelector('button')
        .click()
        .end()
      // End

      .waitForDeletedByCssSelector('input#username')

      /**
       * Logout
       */
      .findByCssSelector('a[ng-click="vm.user.logout()"]')
        .click()
        .end()
      // End


      /**
       * Login
       */
      // Type Name
      .findByCssSelector('input#email')
        .type(EMAIL)
        .end()

      // Type Password
      .findByCssSelector('input#password')
        .type(PASSWORD)
        .end()

      // Press Login Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()
      // End

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'userLoginMobile': function(config) {
      /**
       * Fake contextual data
       */
      // User Credentials
      var date = moment().format('YYYYMMDDHHmmss');
      var NAME = 'Tester' + date;
      var EMAIL = 'tester' + date + '@nutritionix.com';
      var PASSWORD = 'tester';
      // End

      return this.remote
        .get(require.toUrl(config.baseUrl + '/login'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)

      .sleep(config.maxSleepTime)

      /**
       * Create User
       */
      .findByCssSelector('a[ui-sref="account.auth.create.step1"]')
        .click()
        .end()

      // Type Name
      .findByCssSelector('input#firstName')
        .type(NAME)
        .end()

      // Type Email
      .findByCssSelector('input#email')
        .type(EMAIL)
        .end()

        // Type Email Repeat
      .findByCssSelector('input#emailRepeat')
        .type(EMAIL)
        .end()

      // Type Password
      .findByCssSelector('input#password')
        .type(PASSWORD)
        .end()

      // Click on Confirmation Checkbox
      .findByCssSelector('input[ng-model="vm.confirm.track"]')
        .click()
        .end()

      // Click on Confirmation Button
      .findByCssSelector('.btn')
        .click()
        .end()

      .sleep(config.maxSleepTime)
      // Type Username
      .findByCssSelector('input#username')
        .type(NAME)
        .end()

      .findByCssSelector('button')
        .click()
        .end()
      // End

      .waitForDeletedByCssSelector('input#username')
        .execute(function() {
          return $('.slideout-nav-button').click();
        })


      /**
       * Logout
       */
      .findByCssSelector('a[ng-click="vm.user.logout()"]')
        .click()
        .end()
      // End


      /**
       * Login
       */
      // Type Name
      .findByCssSelector('input#email')
        .type(EMAIL)
        .end()

      // Type Password
      .findByCssSelector('input#password')
        .type(PASSWORD)
        .end()

      // Press Login Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()
      // End

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'savePreferences': function(config) {
      /**
       * Fake contextual data
       */
      // User Credentials
      var date = moment().format('YYYYMMDDHHmmss');
      var NAME = 'Tester' + date;

      // User Preferences
      var HEIGHT_FEET = '5';
      var HEIGHT_INCHES = '6';
      var WEIGHT_LB = '151';
      var AGE = '33';
      var MIDDLE_NAME = 'Foo';
      var LAST_NAME = 'Bar';

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)


      /**
       * Persistent Preferences Saves to DB
       */
      .findByCssSelector('a[href="/preferences"]')
        .click()
        .end()

      // Edit Profile
      .findByCssSelector('a[ui-sref="account.cabinet.profile"]')
        .click()
        .end()

      // Set First Name
      .findByCssSelector('input[ng-model="vm.profile.first_name"]')
        .clearValue()
        .type(NAME + MIDDLE_NAME)
        .end()

      // Set Last Name
      .findByCssSelector('input[ng-model="vm.profile.last_name"]')
        .clearValue()
        .type(LAST_NAME)
        .end()

      // Set Gender
      .findByCssSelector('input[value="male"]')
        .click()
        .end()

      // Set Weight
      .findByCssSelector('input[ng-model="vm.weight.lb"]')
        .type(WEIGHT_LB)
        .end()

      // Set Height
      .findByCssSelector('input[ng-model="vm.height.ft"]')
        .type(HEIGHT_FEET)
        .end()

      .findByCssSelector('input[ng-model="vm.height.inch"]')
        .type(HEIGHT_INCHES)
        .end()

      // Set Years Old
      .findByCssSelector('input[ng-model="vm.age"]')
        .type(AGE)
        .end()

      // Set Unit to "Metric"
      .findByCssSelector('input[value="metric"]')
        .click()
        .end()

      // Press Update Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()

      // Confirm If Updated Data is Persistent
      .findByCssSelector('a[href="/preferences"]')
        .click()
        .end()

      .waitForDeletedByCssSelector('input[ng-model="vm.profile.first_name"]')
        .end()

      .refresh()

      .findByCssSelector('a[ui-sref="account.cabinet.profile"]')
        .click()
        .end()

      // Verify First Name Field
      .sleep(config.maxSleepTime)
      .execute(function() {
          return $('input[ng-model="vm.profile.first_name"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, NAME + MIDDLE_NAME);
        })
        .end()

      // Verify Last Name Field
      .execute(function() {
          return $('input[ng-model="vm.profile.last_name"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, LAST_NAME);
        })
        .end()

      // Verify Unit Field
      .findByCssSelector('input[value="metric"]')
        .isSelected()
        .then(function(bool) {
          assert.strictEqual(bool, true);
        })
        .end()

      // Set Unit back to "Imperial(US)"
      .findByCssSelector('input[value="imperial"]')
        .click()
        .end()

      // Verify Gender Field
      .findByCssSelector('input[value="male"]')
        .isSelected()
        .then(function(bool) {
          assert.strictEqual(bool, true);
        })
        .end()

      // Verify Weight Field
      .execute(function() {
          return $('input[ng-model="vm.weight.lb"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, WEIGHT_LB);
        })
        .end()

      // Verify Height Feet Field
      .execute(function() {
          return $('input[ng-model="vm.height.ft"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, HEIGHT_FEET);
        })
        .end()

      // Verify Height Inches Field
      .execute(function() {
          return $('input[ng-model="vm.height.inch"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, HEIGHT_INCHES);
        })
        .end()

      // Verify Age Field
      .execute(function() {
          return $('input[ng-model="vm.age"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, AGE);
        })
        .end()

      // Press Update Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'savePreferencesMobile': function(config) {
      /**
       * Fake contextual data
       */
      // User Credentials
      var date = moment().format('YYYYMMDDHHmmss');
      var NAME = 'Tester' + date;

      // User Preferences
      var HEIGHT_FEET = '5';
      var HEIGHT_INCHES = '6';
      var WEIGHT_LB = '151';
      var AGE = '33';
      var MIDDLE_NAME = 'Foo';
      var LAST_NAME = 'Bar';

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)


      /**
       * Persistent Preferences Saves to DB
       */
      .sleep(config.maxSleepTime)
      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .sleep(config.maxSleepTime)
      .findByCssSelector('a[href="/preferences"]')
        .click()
        .end()

      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      // Edit Profile
      .findByCssSelector('a[ui-sref="account.cabinet.profile"]')
        .click()
        .end()

      // Set First Name
      .findByCssSelector('input[ng-model="vm.profile.first_name"]')
        .clearValue()
        .type(NAME + MIDDLE_NAME)
        .end()

      // Set Last Name
      .findByCssSelector('input[ng-model="vm.profile.last_name"]')
        .clearValue()
        .type(LAST_NAME)
        .end()

      // Set Gender
      .findByCssSelector('input[value="male"]')
        .click()
        .end()

      // Set Weight
      .findByCssSelector('input[ng-model="vm.weight.lb"]')
        .clearValue()
        .end()

      .findByCssSelector('input[ng-model="vm.weight.lb"]')
        .type(WEIGHT_LB)
        .end()

      // Set Height
      .findByCssSelector('input[ng-model="vm.height.ft"]')
        .type(HEIGHT_FEET)
        .end()

      .findByCssSelector('input[ng-model="vm.height.inch"]')
        .type(HEIGHT_INCHES)
        .end()

      // Set Years Old
      .findByCssSelector('input[ng-model="vm.age"]')
        .type(AGE)
        .end()

      // Set Unit to "Metric"
      .findByCssSelector('input[value="metric"]')
        .click()
        .end()

      // Press Update Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()

      // Confirm If Updated Data is Persistent
      .sleep(config.maxSleepTime)
      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .sleep(config.maxSleepTime)
      .findByCssSelector('a[href="/preferences"]')
        .click()
        .end()

      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .waitForDeletedByCssSelector('input[ng-model="vm.profile.first_name"]')
        .end()

      .refresh()

      .findByCssSelector('a[ui-sref="account.cabinet.profile"]')
        .click()
        .end()

      // Verify First Name Field
      .sleep(config.maxSleepTime)
      .execute(function() {
          return $('input[ng-model="vm.profile.first_name"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, NAME + MIDDLE_NAME);
        })
        .end()

      // Verify Last Name Field
      .execute(function() {
          return $('input[ng-model="vm.profile.last_name"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, LAST_NAME);
        })
        .end()

      // Verify Unit Field
      .findByCssSelector('input[value="metric"]')
        .isSelected()
        .then(function(bool) {
          assert.strictEqual(bool, true);
        })
        .end()

      // Set Unit back to "Imperial(US)"
      .findByCssSelector('input[value="imperial"]')
        .click()
        .end()

      // Verify Gender Field
      .findByCssSelector('input[value="male"]')
        .isSelected()
        .then(function(bool) {
          assert.strictEqual(bool, true);
        })
        .end()

      // Verify Weight Field
      .execute(function() {
          return $('input[ng-model="vm.weight.lb"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, WEIGHT_LB);
        })
        .end()

      // Verify Height Feet Field
      .execute(function() {
          return $('input[ng-model="vm.height.ft"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, HEIGHT_FEET);
        })
        .end()

      // Verify Height Inches Field
      .execute(function() {
          return $('input[ng-model="vm.height.inch"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, HEIGHT_INCHES);
        })
        .end()

      // Verify Age Field
      .execute(function() {
          return $('input[ng-model="vm.age"]').val();
        })
        .then(function(value) {
          assert.strictEqual(value, AGE);
        })
        .end()

      // Press Update Button
      .findByCssSelector('button[type="submit"]')
        .click()
        .end()

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'logFood': function(config) {
      /**
       * Fake contextual data
       */

      // Consumed Food
      var FOOD = 'Apple';
      // End

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)

      /**
       * Test Logging Food(persisting to db)
       */
      .findByCssSelector('a[href="/dashboard"]')
        .click()
        .end()

      .findByCssSelector('button[ng-click="vm.addFoodModal()"]')
        .click()
        .end()

      .findByCssSelector('textarea[name="query"]')
        .type(FOOD)
        .end()

      .findByCssSelector('div[ng-click="vm.submit()"]')
        .click()
        .end()

      .sleep(config.maxSleepTime)
      .findByCssSelector('button[ng-click="vm.submit()"]')
        .click()
        .end()

      .refresh()

      .findByCssSelector('li[drag-data="food"]')
        .getVisibleText()
        .then(function(text) {
          assert(text.indexOf(FOOD) > -1, 'Food should be logged and persistent in DB')
        })

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'logFoodMobile': function(config) {
      /**
       * Fake contextual data
       */

      // Consumed Food
      var FOOD = 'Apple';
      // End

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)

      /**
       * Test Logging Food(persisting to db)
       */
      .sleep(config.maxSleepTime)
      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .sleep(config.maxSleepTime)
      .findByCssSelector('a[href="/dashboard"]')
        .click()
        .end()

      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .execute(function() {
          $("html, body").animate({
            scrollTop: $(document).height()
          }, "fast");
          return true;
        })
        .end()

      .findByCssSelector('.btn-track-wrap button[ng-click="vm.addFoodModal()"]')
        .click()
        .end()

      .findByCssSelector('textarea[name="query"]')
        .type(FOOD)
        .end()

      .findByCssSelector('div[ng-click="vm.submit()"]')
        .click()
        .end()

      .findByCssSelector('button[ng-click="vm.submit()"]')
        .click()
        .end()

      .refresh()

      .findByCssSelector('li[drag-data="food"]')
        .getVisibleText()
        .then(function(text) {
          assert(text.indexOf(FOOD) > -1, 'Food should be logged and persistent in DB')
        })

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'logWeight': function(config) {
      /**
       * Fake contextual data
       */

      // Consumed Food
      var WEIGHT = '145.9';
      // End

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)

      /**
       * Test Weight Logginf(persisting to db)
       */
      .findByCssSelector('a[href="/dashboard"]')
        .click()
        .end()

      .findByCssSelector('span[ng-click="vm.addWeightModal()"]')
        .click()
        .end()

      .sleep(config.maxSleepTime * 2)
      .findByCssSelector('input[ng-model="vm.weight"]')
        .clearValue()
        .type(WEIGHT)
        .end()

      .findByCssSelector('.modal-weigh-in button[ng-click="vm.submit()"]')
        .click()
        .end()
        .refresh()

      // Verify most recent logged weight
      .sleep(config.maxSleepTime * 2)
      .findByCssSelector('li[ng-click="vm.addWeightModal(weight)"]')
        .getVisibleText()
        .then(function(text) {
          assert(text.indexOf(WEIGHT) > -1, 'Weight should be logged and persistent in DB');
        })

      // If not errors then return true
      .then(function() {
        return true;
      });
    },


    'logWeightMobile': function(config) {
      /**
       * Fake contextual data
       */

      // Consumed Food
      var WEIGHT = '145.9';
      // End

      return this.remote
        // .get(require.toUrl(config.baseUrl + '/dashboard'))
        .then(function() {
          if (config.mobileDevice != true) {
            this.setWindowSize(config.width, config.height);
          }
        })
        .setFindTimeout(config.maxFindTimeout)

      /**
       * Test Weight Logging(persisting to db)
       */
       .sleep(config.maxSleepTime)
       .execute(function() {
         return $('.slideout-nav-button').click();
       })

      .findByCssSelector('a[href="/dashboard"]')
        .click()
        .end()

      .execute(function() {
        return $('.slideout-nav-button').click();
      })

      .findByCssSelector('span[ng-click="vm.addWeightModal()"]')
        .click()
        .end()

      .sleep(config.maxSleepTime)
      .findByCssSelector('input[ng-model="vm.weight"]')
        .clearValue()
        .type(WEIGHT)
        .end()

      .findByCssSelector('.modal-weigh-in button[ng-click="vm.submit()"]')
        .click()
        .end()
        .refresh()

      // Verify most recent logged weight
      .sleep(config.maxSleepTime)
      .findByCssSelector('li[ng-click="vm.addWeightModal(weight)"]')
        .getVisibleText()
        .then(function(text) {
          assert(text.indexOf(WEIGHT) > -1, 'Weight should be logged and persistent in DB');
        })

      // If not errors then return true
      .then(function() {
        return true;
      });
    },
  };

  return TrackAppPage;
});
