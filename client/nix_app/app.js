(function () {
  'use strict';

  // needs to be in the separate module to be available in dependencies of the nutritionix module
  angular.module('nutritionix.constants', [])
    .constant('baseUrl', (function () {
      //if (['nutritionixtest.com', 'nutritionix.com'].indexOf(location.host.replace(/^www\./, '')) > -1) {
      //  return '//beta.nutritionix.com';
      //}

      //return '//' + location.host;

      return '';
    }()))
    .constant('cdnUrls', {
      'nix-export':       'https://d1gvlspmcma3iu.cloudfront.net',
      'cdn4-nutritionix': 'https://s3.amazonaws.com/cdn4-nutritionix'
    })
    .constant('developerMode', location.href.indexOf('developer') > -1);

  angular
    .module('nutritionix', [
      'facebook',
      'ng.shims.placeholder',
      'debounce',
      'focus-if',
      'toggleCheckbox',
      'ngAnimate',
      'angular-google-analytics',
      'angular-wufoo-forms',
      'angular-prerender',
      'angular-loading-bar',
      'ngMessages',
      'angularMoment',
      'nutritionix.constants',
      'ui.router',
      'ui.bootstrap',
      'ui.router.metatags',
      'rt.encodeuri',
      'nix.track-api-client',
      'nix.fda-round-filter',
      'nix.diet-graph-directive',
      'nix.textcomplete',
      'nutritionix.nutrition-label',
      'confirm',
      'navbar',
      'footer',
      'carouselSlide',
      'consumerTools',
      'business',
      'contact',
      'ngSanitize',
      'businessApi',
      'databaseLicense',
      'restaurantPlatform',
      'naturalLanguage',
      'items',
      'food',
      'nix.api',
      'ngStorage',
      'about',
      'brands',
      'mini',
      'ads',
      'database',
      'privacy',
      'terms',
      'calculators',
      'grocery',
      'category',
      'account',
      'recipes',
      'naturalDemo',
      'premium',
      'nutritionlink',
      'labs',
      'dailyCalories',
      'reports',
      'trackApp',
      'oauth',
      'nutritionix.forms',
      'track-widget',
      'interactiveNutritionTools',
      'messenger-bot',
      'tshirt',
      'fda-compliance',
      'dev',
      'payment',
      'restaurantMap',
      'diets',
      'exercise',
      'banner',
      'customer',
      'nixy',
      'list'
    ])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
    }])
    .config(function () {
      const decodeUriComponent = window.decodeURIComponent.bind(window);

      window.decodeURIComponent = function (input) {
        try {
          return decodeUriComponent(input);
        } catch (e) {
          return input;
        }
      }
    })
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, baseUrl, $httpProvider, FacebookProvider) {

      FacebookProvider.init('484200498422486');
      FacebookProvider.setSdkVersion('v2.8');

      $stateProvider.state('site', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/site.html'
      });

      $stateProvider.state('site.ie9-landing', {
        url:         '^',
        metaTags:    {
          description: 'The largest verified database of nutrition information.',
          title:       'Nutritionix - Largest Verified Nutrition Database'
        },
        templateUrl: baseUrl + '/nix_app/landing/landing.html'
      });

      $stateProvider.state('site.landing', {
        url:         '/',
        metaTags:    {
          description: 'The largest verified database of nutrition information.',
          title:       'Nutritionix - Largest Verified Nutrition Database'
        },
        controller:  'LandingCtrl',
        templateUrl: baseUrl + '/nix_app/landing/landing.html'
      });

      $stateProvider
        .state('site.404', {
          metaTags:    {
            title:       'Nutritionix - Page not found',
            description: 'Sorry, the page you are looking for could not be found.'
          },
          templateUrl: baseUrl + '/nix_app/404.html',
          controller:  function (prerender) {
            prerender.statusCode = 404;
          }
        })
        .state('site.50x', {
          templateUrl: baseUrl + '/nix_app/50x.html',
          controller:  function (prerender) {
            prerender.statusCode = 500;
          }
        })
        .state('site.400', {
          templateUrl: baseUrl + '/nix_app/50x.html',
          controller:  function (prerender) {
            prerender.statusCode = 400;
          }
        });

      $urlRouterProvider.otherwise(function ($injector) {
        $injector.get('$state').go('site.404');
      });

      $locationProvider.html5Mode(true);

      // globally handle internal server errors with 50x error page
      $httpProvider.interceptors.push(function ($q, $injector) {
        return {
          'responseError': function (response) {
            if (response.config.handle404 && response.status === 404) {
              $injector.get('$state').go('site.404');
            }

            if (!response.config.ignore500 && response.status >= 500) {
              $injector.get('$state').go('site.50x');
            }

            if (!response.config.ignore401 && response.status === 401 && response.config.url.indexOf('/track-api/v2') === 0) {
              $injector.get('user').logout();
            }

            return $q.reject(response);
          }
        };
      });
    })
    .config(function (UIRouterMetatagsProvider) {
      const logoUrl = 'https://www.nutritionix.com/nix_assets/images/nix_apple.png';
      let staticProperties = {
        'og:site_name': 'Nutritionix',
        'og:image':     logoUrl,
        'og:type':      'website',
        'og:locale':    'en_US',
        'fb:app_id':    '966242223397117',

        'twitter:card':  'summary',
        'twitter:site':  '@nutritionix',
        'twitter:image': logoUrl
      };

      let browser = (new UAParser()).getResult();

      if (browser.device.vendor === 'Apple' && browser.device.type === 'mobile') {
        staticProperties['apple-itunes-app'] = 'app-id=1061691342';
      }

      UIRouterMetatagsProvider
        .setDefaultTitle('Nutritionix')
        .setStaticProperties(staticProperties)
        .setOGURL(true);
    })
    .config(function ($logProvider) {
      $logProvider.debugEnabled(_(location.host).contains('localhost'));
    })
    .config(function (AnalyticsProvider) {
      // without this it seem to send an extra page view during app initialisation
      AnalyticsProvider.ignoreFirstPageLoad(true);
      AnalyticsProvider.setPageEvent('$delayedStateChangeSuccess');
      AnalyticsProvider.setAccount('UA-19183277-1');
      // Track all URL query params (default is false).
      AnalyticsProvider.trackUrlParams(true);
    })
    .run(function (Analytics, $rootScope, baseUrl, $timeout, $state) {
      $rootScope.$state = $state;

      $rootScope.baseUrl = baseUrl;

      // this way I make analytics be properly affected by UIRouterMetatags service.
      // otherwise GA does not catch up new page title
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $timeout(function () {
          $rootScope.$emit('$delayedStateChangeSuccess', event, toState, toParams, fromState, fromParams);
        }, 0);
      });

    })
    .config(function (nixTrackApiClientProvider) {
      nixTrackApiClientProvider.setApiEndpoint('/track-api/v2');
      nixTrackApiClientProvider.setHttpConfig({ignore500: true});
    })
    .factory('refreshUserProfile', function (user, nixTrackApiClient, $q) {
      nixTrackApiClient.setUserJwt(() => user.get('jwt'));
      if (user.get('jwt')) {
        return nixTrackApiClient.me()
          .then(response => {user.setUserProfile(response.data)})
          .catch(() => null);
      }

      return $q.resolve();
    })
    .run(function (refreshUserProfile) {})
    .run(function (user, nutritionLabelGlobalOptions) {
      angular.extend(nutritionLabelGlobalOptions, {
        showLegacyVersion: true,
        hideModeSwitcher:  true,
        allowFDARounding:  false,
        applyMathRounding: true,
        showPolyFat:       false,
        showMonoFat:       false,
        legacyVersion:     2,
        calorieIntake:     () => user.getIsAuthenticated() && user.get('daily_kcal') || 2000
      });
    });
})();

$(function () {
  angular.bootstrap(angular.element('html'), ['nutritionix']);
});
