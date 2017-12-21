(function () {
  'use strict';

  angular.module('labs.twitter')
    .factory('twitterReplier', function ($window, $state, $location, $filter, $rootScope) {
      var twitterReplier = {
        showLinks:    false,
        generateHref: function (tweet) {
          if (!(tweet && angular.isArray(tweet.foods))) {
            return null;
          }

          return 'https://hive2.nutritionix.com/#/admin-tools/track/twitter-responder/' + tweet.tweet_id;
        }
      };

      angular.element($window).on('keydown', function (event) {
        if (event.altKey === true && event.which === 18) {
          twitterReplier.showLinks = true;
          $rootScope.$digest();
        }
      });

      angular.element($window).on('click keyup', function (event) {
        twitterReplier.showLinks = false;
        $rootScope.$digest();
      });

      return twitterReplier;
    })
    .directive('tweetReply', function (twitterReplier, $window) {
      return {
        replace:  true,
        template: '<a ng-href="{{href}}" ng-show="href && twitterReplier.showLinks" target="_blank">Reply</a>',
        scope:    {
          tweet: '=tweetReply'
        },
        link:     function (scope, element /*, attributes*/) {
          scope.twitterReplier = twitterReplier;
          scope.$watch('tweet.foods', function () {
            scope.href = twitterReplier.generateHref(scope.tweet);
          });

          element.on('click', function (event) {
            event.preventDefault();

            if (element.attr('href')) {
              $window.open(element.attr('href'));
            }
          });
        }
      }
    })
}());
