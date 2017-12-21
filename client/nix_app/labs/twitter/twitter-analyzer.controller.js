(function () {
  'use strict';

  angular
    .module('labs.twitter')
    .controller('TwitterAnalyzerCtrl', TwitterAnalyzerCtrl);

  function TwitterAnalyzerCtrl($scope, initialTweets, Pusher) {
    var vm = $scope.vm = this;

    vm.calculateCalories = function (tweet) {
      return _.reduce(tweet.foods, function (total, food) {
        total += food.nf_calories || 0;
        return total;
      }, 0)
    };

    $scope.tweets = initialTweets;
    Pusher.subscribe('tweets', 'push_tweet', function (item) {
      $scope.tweets.unshift(item);
      $scope.tweets = $scope.tweets.slice(0, 19);
    });

    $scope.deleteTweet = function (item) {
      var x = _.indexOf(_.pluck($scope.tweets, 'tweet_id'), item.tweet_id);
      $scope.tweets.splice(x, 1);
    };

    vm.getFoodsList = function (tweet) {
      return _.pluck(tweet.foods, 'food_name');
    };
  }
})();
