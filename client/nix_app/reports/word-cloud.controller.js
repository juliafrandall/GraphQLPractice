(function (undefined) {
  'use strict';

  angular
    .module('reports')
    .controller('ReportsWordCloudCtrl', ReportsWordCloudCtrl);

  function ReportsWordCloudCtrl($scope, nixTrackApiClient) {
    let vm = $scope.vm = this;

    nixTrackApiClient('/me/autocomplete', {params: {source: 1, skip_full_nutrients: 'true'}})
      .success(data => {
        vm.words = data.foods
          .filter(food => food.ct >= 2)
          .map(food => {
            return {
              text:   food.food_name,
              weight: food.ct,
              html:   {
                style: 'color: ' + (
                  food.nf_calories > 500 ||
                  food.nf_calories / food.serving_weight_grams > 3 && food.nf_calories > 200 ? '#EC6A63' : '#58a61c'
                )
              }
            };
          });
      })
  }
})();
