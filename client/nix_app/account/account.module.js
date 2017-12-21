(function () {
  'use strict';

  angular
    .module('account', [
      'facebook', 'ngPassword', 'ui.select', 'ngSanitize',
      'ngCsv', 'ngCookies', 'filearts.dragDrop', 'ngFileUpload',

      'account.coach-portal', 'account.recipes', 'account.lists'
    ])
    .config(config)
    .run(run)
    .factory('forceHttps', function ($location, $window, $log, $timeout) {
      function forceHttps() {
        if (!forceHttps.$disabled && $location.protocol() !== 'https') {
          if ($location.host().match('nutritionix.com')) {
            $timeout(() => $window.location = $location.absUrl().replace('http', 'https'));
            return false;
          } else {
            $log.debug('https will be forced on production site');
          }
        }

        return true;
      }

      forceHttps.disable = () => {forceHttps.$disabled = true;};
      forceHttps.enable  = () => {forceHttps.$disabled = false;};

      return forceHttps;
    });

  function config($stateProvider, baseUrl, FacebookProvider) {
    FacebookProvider.init('484200498422486');
    FacebookProvider.setSdkVersion('v2.5');

    $stateProvider
      .state('account', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/account.html',
        onEnter:     function ($anchorScroll, forceHttps) {
          forceHttps();
          $anchorScroll();
        },
        data:        {
          cssClass: 'account'
        },
        resolve:     {
          _waitForUser: refreshUserProfile => refreshUserProfile
        }
      })
      .state('account.cabinet', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/account.cabinet.html',
        data:        {
          requiresLogin: true,
          cssClass:      'account logged-in'
        }
      })
      .state('account.cabinet.delete', {
        url:         '/account/delete',
        metaTags:    {
          title: 'Delete Nutritionix Track Account'
        },
        controller:  'AccountDeleteCtrl',
        templateUrl: baseUrl + '/nix_app/account/delete.html'
      })
      .state('account.cabinet.help', {
        url:         '/dashboard/help',
        metaTags:    {
          title: 'Track - Help'
        },
        controller:  'AccountHelpCtrl',
        templateUrl: baseUrl + '/nix_app/account/help.html'
      })
      .state('account.cabinet.dailyGoals', {
        url:         '/dashboard/daily-goals',
        metaTags:    {
          title: 'Track - Daily Goals'
        },
        controller:  'AccountDailyGoalsCtrl',
        templateUrl: baseUrl + '/nix_app/account/dailyGoals.html'
      })
      // .state('account.cabinet.shareFoodLog', {
      //  url:         '/dashboard/share',
      //  metaTags:    {
      //    title: 'Track - Share Food Log'
      //  },
      //  controller:  'AccountShareFoodLogCtrl',
      //  templateUrl: baseUrl + '/nix_app/account/shareFoodLog.html'
      // })
      .state('account.cabinet.dashboard', {
        url:         '/dashboard',
        metaTags:    {
          title: 'Track - {{ firstname }}\'s Food Log'
        },
        controller:  'AccountDashboardCtrl',
        templateUrl: baseUrl + '/nix_app/account/dashboard.html',
        resolve:     {
          firstname: function (user) {
            return user.get('first_name');
          },
          me:        function (user) {
            return user.getUserProfile();
          }
        }
      })
      .state('account.cabinet.dashboard.date', {
        metaTags: {
          title: 'Track - {{ firstname }}\'s Food Log'
        },
        url:      '/:date'
      })
      .state('account.cabinet.dashboard.addFood', {
        url: '/add/:tab'
      })
      .state('account.cabinet.dashboard.addFood.navigate', {
        url: '/:brand_id?q'
      })
      .state('account.cabinet.messages', {
        url:         '/messages',
        metaTags:    {
          title: 'Track - Messages'
        },
        controller:  'AccountMessagesCtrl',
        templateUrl: baseUrl + '/nix_app/account/messages.html'
      })
      .state('account.cabinet.messageDetail', {
        url:         '/messages/view/:id',
        metaTags:    {
          title: 'Track - View Message'
        },
        controller:  'AccountViewMessageCtrl',
        templateUrl: baseUrl + '/nix_app/account/message.view.html'
      })
      .state('account.cabinet.csvExport', {
        url:         '/labs/csv-export',
        metaTags:    {
          title: 'Track - CSV Export'
        },
        controller:  'AccountCsvExportCtrl',
        templateUrl: baseUrl + '/nix_app/account/csvExport.html'
      })
      .state('account.cabinet.preferences', {
        url:         '/preferences',
        metaTags:    {
          title: 'Track - Preferences'
        },
        controller:  'AccountPreferencesCtrl',
        templateUrl: baseUrl + '/nix_app/account/preferences.html'
      })
      .state('account.cabinet.labs', {
        url:         '/labs',
        metaTags:    {
          title: 'Track - Labs'
        },
        controller:  'AccountLabsCtrl',
        templateUrl: baseUrl + '/nix_app/account/labs.html'
      })
      .state('account.cabinet.profile', {
        url:         '/account',
        metaTags:    {
          title: 'Track - My Profile'
        },
        controller:  'AccountProfileCtrl',
        templateUrl: baseUrl + '/nix_app/account/profile.html'
      })
      .state('account.cabinet.publicProfile', {
        url:         '/public-profile',
        metaTags:    {
          title: 'Track - Public Profile'
        },
        controller:  'AccountPublicProfileCtrl',
        templateUrl: baseUrl + '/nix_app/account/publicProfile.html'
      })
      .state('account.cabinet.primaryNutrient', {
        url:         '/preferences/primary-nutrient',
        metaTags:    {
          title: 'Track - Primary Nutrient'
        },
        controller:  'AccountPreferencesPrimaryNutrientCtrl',
        templateUrl: baseUrl + '/nix_app/account/preferences.primaryNutrient.html'
      })
      .state('account.cabinet.onboarding', {
        url:         '/onboarding',
        metaTags:    {
          title: 'Track - Onboarding'
        },
        controller:  'AccountOnBoardingCtrl',
        templateUrl: baseUrl + '/nix_app/account/onboarding.html'
      })
      .state('account.cabinet.myFoods', {
        url:         '/my-recipes?show',
        metaTags:    {
          title: 'Track - My Recipes'
        },
        controller:  'MyFoodsCtrl',
        templateUrl: baseUrl + '/nix_app/account/myFoods.html'
      })
      .state('account.cabinet.createFood', {
        url:         '/my-foods/create',
        metaTags:    {
          title: 'Track - Create Food'
        },
        templateUrl: baseUrl + '/nix_app/account/createFood.html'
      })
      .state('account.cabinet.createCustomFood', {
        url:         '/my-foods/custom-food',
        metaTags:    {
          title: 'Track - Create Custom Food'
        },
        controller:  'MyFoodsCustomFoodCtrl',
        templateUrl: baseUrl + '/nix_app/account/customFood.html',
        resolve:     {
          food: () => null
        }
      })
      .state('account.cabinet.editCustomFood', {
        url:         '/my-foods/custom-food/:id',
        metaTags:    {
          title: 'Track - Edit Custom Food {{food.food_name}}'
        },
        controller:  'MyFoodsCustomFoodCtrl',
        templateUrl: baseUrl + '/nix_app/account/customFood.html',
        resolve:     {
          food: ($stateParams, nixTrackApiClient, $state) => nixTrackApiClient.recipes.get($stateParams.id)
            .then(response => response.data)
            .catch(response => $state.go('404'))
        }
      })
      .state('account.cabinet.dailyCalories', {
        url:         '/calculate-daily-calories',
        metaTags:    {
          title:       'Track - Daily Calories',
          description: 'Calculate recommended daily calories'
        },
        templateUrl: baseUrl + '/nix_app/account/preferences.dailyCalories.html',
        controller:  'AccountPreferencesDailyCaloriesCtrl as vm'
      })
      .state('account.cabinet.connectedApps', {
        url:         '/preferences/connected-apps',
        metaTags:    {
          title: 'Track - Connected Apps'
        },
        controller:  'ConnectedAppsCtrl',
        templateUrl: baseUrl + '/nix_app/account/connectedApps.html'
      })
      .state('account.cabinet.smsReminders', {
        url:         '/preferences/sms-reminders',
        metaTags:    {
          title: 'Track - SMS Reminders'
        },
        controller:  'SmsRemindersCtrl',
        templateUrl: baseUrl + '/nix_app/account/smsReminders.html'
      })
      .state('account.cabinet.calorieCountImport', {
        url:         '/labs/calorie-count-import',
        metaTags:    {
          title: 'Track - Calorie Count CSV Import'
        },
        controller:  'AccountCalorieCountImportCtrl',
        templateUrl: baseUrl + '/nix_app/account/calorie-count-import.html'
      })
      .state('account.auth', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/account.auth.html'
      })
      .state('account.auth.create', {
        abstract:   true,
        template:   '<div ui-view></div>',
        controller: 'AccountCreateCtrl'
      })
      .state('account.auth.create.step1', {
        url:         '/account/create?ac',
        metaTags:    {
          title:       'Track - Create Account',
          description: 'Nutritionix Track Create Account - Free calorie counter with weight and exercise tracking',
        },
        controller:  'AccountCreateStep1Ctrl',
        templateUrl: baseUrl + '/nix_app/account/create.step1.html',
        data:        {
          cssClass: 'page-account-create'
        }
      })
      .state('account.auth.create.activate', {
        url:         '/account/activate?email',
        controller:  'AccountCreateActivateCtrl',
        templateUrl: baseUrl + '/nix_app/account/create.activate.html'
      })
      .state('account.auth.create.step2', {
        url:         '/account/setup',
        controller:  'AccountCreateStep2Ctrl',
        templateUrl: baseUrl + '/nix_app/account/create.step2.html',
        resolve:     {
          countryData: function ($http) {
            return $http.get('https://d1gvlspmcma3iu.cloudfront.net/country-codes.json')
              .then(response => response.data)
              .catch(() => {
                return [{
                  "name":                             "US",
                  "official_name_en":                 "United States of America",
                  "official_name_fr":                 "États-Unis d'Amérique",
                  "ISO3166-1-Alpha-2":                "US",
                  "ISO3166-1-Alpha-3":                "USA",
                  "ISO3166-1-numeric":                "840",
                  "ITU":                              "USA",
                  "MARC":                             "xxu",
                  "WMO":                              "US",
                  "DS":                               "USA",
                  "Dial":                             "1",
                  "FIFA":                             "USA",
                  "FIPS":                             "US",
                  "GAUL":                             "259",
                  "IOC":                              "USA",
                  "ISO4217-currency_alphabetic_code": "USD",
                  "ISO4217-currency_country_name":    "UNITED STATES",
                  "ISO4217-currency_minor_unit":      "2",
                  "ISO4217-currency_name":            "US Dollar",
                  "ISO4217-currency_numeric_code":    "840",
                  "is_independent":                   "Yes",
                  "Capital":                          "Washington",
                  "Continent":                        "NA",
                  "TLD":                              ".us",
                  "Languages":                        "en-US,es-US,haw,fr",
                  "geonameid":                        "6252001",
                  "EDGAR":                            ""
                }]
              })
              .then(countryData => countryData
                .map(info => ({name: info.official_name_en || info.name, country_code: info['ISO3166-1-numeric']}))
                .filter(value => value.name && value.country_code)
              )
          }
        },
        data:        {requiresLogin: true}
      })
      .state('account.auth.create.complete', {
        url:         '/account/complete',
        templateUrl: baseUrl + '/nix_app/account/create.complete.html'
      })
      .state('account.auth.forgotPassword', {
        url:         '/account/forgot-password?email',
        metaTags:    {
          title:       'Track - Forgot Password',
          description: 'Nutritionix Track Account Password Recovery',
        },
        controller:  'AccountForgotPasswordCtrl',
        templateUrl: baseUrl + '/nix_app/account/forgotPassword.html'
      })
      .state('account.auth.resetPassword', {
        url:         '/account/forgot-password/reset?key',
        controller:  'AccountResetPasswordCtrl',
        templateUrl: baseUrl + '/nix_app/account/resetPassword.html'
      })
      .state('account.login', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/account.auth.html'
      })
      .state('account.login.login', {
        url:         '/login',
        metaTags:    {
          title:       'Track - Login',
          description: 'Nutritionix Track Web Login - Free calorie counter with weight and exercise tracking',
        },
        templateUrl: baseUrl + '/nix_app/account/login.html',
        controller:  'LoginCtrl as vm',
        resolve:     {
          facebookLoginStatus: (Facebook, $q, $timeout) => {
            return $q((resolve/*, reject*/) => {
              let resolved = false;
              Facebook.getLoginStatus(response => {
                if (!resolved) {
                  resolved = true;
                  resolve(response);
                }
              });

              // in case FB SDK isn't working for some reason we will still show login page

              $timeout(() => {
                if (!resolved) {
                  resolved = true;
                  resolve(null);
                }
              }, 2000)
            });
          }
        }
      });
  }

  function run($rootScope, $state, user, forceHttps, $sessionStorage, $location, nixTrackUtils) {
    $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams /*, fromState, fromParams*/) {
        if (!user.getIdentity()) {
          if (toState.data && toState.data.requiresLogin) {
            event.preventDefault();

            if (forceHttps()) {
              user.return = {
                toState:  toState,
                toParams: toParams
              };

              user.location = $location.search();

              $state.go('account.login.login');
            }
          }
        } else if (toState.name === 'account.login.login') {
          event.preventDefault();
          if (user.return) {
            $state.go(user.return.toState, user.return.toParams);
            user.return = null;
          } else {
            if ($location.search().ref === 'caloriecount') {
              $state.go('account.cabinet.calorieCountImport');
            } else {
              $state.go('account.cabinet.dashboard')
            }
          }
        }
      });

    $rootScope.$watch(() => user.getIdentity(),
      function (identity) {
        if (!identity) {
          if ($state.current.data && $state.current.data.requiresLogin) {
            user.return = {
              toState:  $state.current,
              toParams: $state.params
            };
            $state.go('account.login.login');
          }
        } else if ($state.current.name === 'account.login.login') {
          if ($sessionStorage.oauth) {
            $state.go('oauth.authorize');
          } else if ($sessionStorage.messengerBot) {
            $state.go('messenger-bot.authorize');
          } else if ($sessionStorage.calorieCount || $location.search().ref === 'caloriecount') {
            $sessionStorage.calorieCount = null;
            $state.go('account.cabinet.calorieCountImport');
          } else if (!user.get('account_setup')) {
            $state.go('account.auth.create.step2');
          } else if (user.returnUrl) {
            $location.url(user.returnUrl);
            user.returnUrl = null;
          } else if (user.return) {
            $state.go(user.return.toState, user.return.toParams);
            user.return = null;
          } else {
            $state.go('account.cabinet.dashboard')
          }
        }
      });
  }
})();
