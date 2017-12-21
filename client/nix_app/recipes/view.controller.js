(function () {
  'use strict';

  angular
    .module('recipes')
    .controller('RecipesViewCtrl', RecipesViewCtrl);

  function RecipesViewCtrl($scope, $filter, recipe, reviewFoodsBasket,
                           user, nixTrackApiClient, nixTrackUtils, $window, $timeout, $httpParamSerializer) {
    let vm = $scope.vm = this;
    const topMicronutrients  = [305, 262];
    const skipMicronutrients = nixTrackApiClient.macronutrients.concat(topMicronutrients);

    vm.recipe = recipe;

    vm.directions = recipe.directions ? recipe.directions.split('\n').filter(v => !!v.trim()) : null;

    _.extend(vm.recipe, nutritionixApiDataUtilities.extendFullNutrientsWithMetaData(vm.recipe.full_nutrients));

    vm.labelData = $filter('trackFoodToLabelData')(
      vm.recipe,
      {
        itemName        : vm.recipe.name,
        micronutrients  : []
      },
      vm.recipe.serving_qty
    );

    _.forEach(topMicronutrients, function (nutrientId) {
      let nutrient = $filter('nutrient')(vm.labelData.full_nutrients, nutrientId);
      if (nutrient) {
        vm.labelData.micronutrients.push(nutrient);
      }
    });

    _.forEach(vm.labelData.full_nutrients, function (nutrient) {
      if (_.indexOf(skipMicronutrients, nutrient.attr_id) === -1) {
        vm.labelData.micronutrients.push(nutrient);
      }
    });


    let food = vm.food = angular.copy(_.pick(vm.recipe, [
      'food_name', 'full_nutrients', 'photo',
      'serving_qty', 'serving_unit', 'serving_weight_grams',
      'source', 'source_key'
    ]));

    food.food_name = recipe.name;


    _.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));


    if (food.serving_qty !== 1) {
      nixTrackUtils.multiplyFoodNutrients(
        food,
        nixTrackUtils.calculateFoodMultiplier(food, 1),
        true
      )
    }





    vm.addToFoodLog = () => {
      reviewFoodsBasket.push(food);
      reviewFoodsBasket
        .openModal()
        .result
        .then(() => {
          $state.go('account.cabinet.dashboard');
        });
    };

    vm.addToFoodLog.$enabled = user.getIsAuthenticated();

    vm.food.alcohol = $filter('nutrient')(vm.food.full_nutrients, 221, 'value') || 0;

    vm.deepLink = 'https://nutritionix.app.link/q1?' + $httpParamSerializer({
      a: vm.recipe.full_nutrients
           .filter(n => [203, 204, 205, 208, 269, 291, 305, 306, 307, 601, 606].indexOf(n.attr_id) > -1)
           .map(n => `${n.attr_id}:${_.round(n.value, 1)}`)
           .join(','),
      n: vm.recipe.name,
      q: vm.recipe.serving_qty,
      u: vm.recipe.serving_unit
    });

    let totalCalForPieChart = _.max([
      vm.food.nf_calories,
      vm.food.nf_protein * 4 + vm.food.nf_total_carbohydrate * 4 + vm.food.nf_total_fat * 9 + vm.food.alcohol * 7
    ]);

    vm.pieChart = {
      showAlcohol:     false,
      labels:          ['Protein', 'Carbohydrate', 'Fat'],
      data:            [
        _.round(vm.food.nf_protein * 4 / totalCalForPieChart * 100, 0),
        _.round(vm.food.nf_total_carbohydrate * 4 / totalCalForPieChart * 100, 0),
        _.round(vm.food.nf_total_fat * 9 / totalCalForPieChart * 100, 0)
      ],
      normaliseData:   function () {
        let pieSum = _.sum(this.data);

        if (pieSum > 100) {
          this.data[this.data.indexOf(_.max(this.data))] -= pieSum - 100;
        }
      },
      estimateAlcohol: function () {
        let alcoholPercentage;
        if (vm.food.alcohol) {
          alcoholPercentage = _.round(vm.food.alcohol * 7 / totalCalForPieChart * 100, 0);
        } else {
          let totalCalPercentage = _.sum(this.data);

          if (totalCalPercentage <= 85) {
            alcoholPercentage = 100 - totalCalPercentage;
          }
        }

        if (alcoholPercentage) {
          this.labels.push('Alcohol*');
          this.data.push(alcoholPercentage);
          this.showAlcohol = true;
        }
      },
      generateLabels:  function (chart) {
        // and this is how you alight labels to the bottom left instead of the bottom center when there is no such option. Neat, right ;)
        chart.legend.afterFit = function () {
          _.fill(this.lineWidths, this.width);
        };

        let data = chart.data;
        if (data.labels.length && data.datasets.length) {
          return data.labels.map(function (label, i) {
            let meta                     = chart.getDatasetMeta(0);
            let ds                       = data.datasets[0];
            let arc                      = meta.data[i];
            let custom                   = arc.custom || {};
            let getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
            let arcOpts                  = chart.options.elements.arc;
            let fill                     = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
            let stroke                   = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
            let bw                       = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

            return {
              text:        label + ' ' + ds.data[i] + '%',
              fillStyle:   fill,
              strokeStyle: stroke,
              lineWidth:   bw,
              hidden:      isNaN(ds.data[i]) || meta.data[i].hidden,

              // Extra data used for toggling the correct item
              index: i
            };
          });
        } else {
          return [];
        }
      },
      label:           (tooltipItem, data) => data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%'
    };

    vm.print = function() {
      $timeout(() => $window.print());
    };

    vm.pieChart.estimateAlcohol();
    vm.pieChart.normaliseData();
  }
})();
