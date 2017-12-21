(function () {
  'use strict';

  angular
    .module('labs.twitter')
    .controller('TweetDetailCtrl', TweetDetailCtrl);

  function TweetDetailCtrl($scope, tweet, $filter, nixTrackApiClient, nixTrackUtils) {
    const vm = $scope.vm = this;
    vm.tweet = tweet;

    nixTrackApiClient.natural.nutrients(tweet.tweet, true)
      .success(function (data) {
        const topMicronutrients  = [305, 306, 262];
        const skipMicronutrients = nixTrackApiClient.macronutrients.concat(topMicronutrients);

        if (!data.foods.length) {
          vm.notFound = {
            message: "We couldn't match any of your foods"
          };
          return;
        }

        data.foods.forEach(food => {nutritionixApiDataUtilities.extendFullNutrientsWithMetaData(food.full_nutrients || [])});

        vm.tweet.foods = data.foods;
        vm.total       = $filter('trackFoodToLabelData')(nixTrackUtils.sumFoods(data.foods), {
          itemName:       'Total',
          brandName:      'Nutritionix',
          micronutrients: []
        });

        _.forEach(topMicronutrients, function (nutrientId) {
          let nutrient = $filter('nutrient')(vm.total.full_nutrients, nutrientId);
          if (nutrient) {
            vm.total.micronutrients.push(nutrient);
          }
        });

        _.forEach(vm.total.full_nutrients, function (nutrient) {
          if (_.indexOf(skipMicronutrients, nutrient.attr_id) === -1) {
            vm.total.micronutrients.push(nutrient);
          }
        });
      })
      .error(function (error) {
        if (error.message === "We couldn't match any of your foods") {
          vm.notFound = error;
        } else {
          vm.error = error;
        }
      });
  }

})();


