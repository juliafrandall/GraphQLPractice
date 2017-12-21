(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('ServicesFactory', ServicesFactory);

  function ServicesFactory($sce, baseUrl, nixTrackUtils) {
    function formatTemplateUrl(templateUrl) {
      if (templateUrl[0] !== '/') {
        templateUrl = '/' + templateUrl;
      }
      return $sce.trustAsResourceUrl(baseUrl + templateUrl);
    }

    function cleanUrl(string) {
      var cleanString = string.trim();
      cleanString = cleanString.replace(/[^\w'+]/g, '-').toLowerCase();
      cleanString = cleanString.replace(/'/g, '');
      return cleanString.replace(/(-)\1{1,}/g, '-');
    }

    function cleanWords(string) {
      return string.replace(/\W/g, ' ');
    }

    function roundingCaloriesFDA(calories) {
      calories = Math.round(calories + 0);
      if (calories < 5) {
        return 0;
      }
      if (calories >= 5 && calories <= 50) {
        return (5 * Math.round(calories / 5));
      } else {
        return (Math.round(calories / 10) * 10);
      }
    }

    function normalizeFoodMeasures(food) {
      if (!food.alt_measures || food.alt_measures.length === 0) {return food;}

      let originalMeasure = _.find(
        food.alt_measures,
        {
          measure: food.serving_unit,
          qty:     food.serving_qty
        }
      );

      if (!originalMeasure) {
        originalMeasure = {
          serving_weight: food.serving_weight_grams,
          measure:        food.serving_unit,
          seq:            null,
          qty:            food.serving_qty
        };
      }

      // we can't predict which measure will be left by _.uniq call below,
      // so this ensures, that originalMeasure will be present in the resulting array;
      food.alt_measures.forEach(measure => {
        if (measure.measure === originalMeasure.measure) {
          food.alt_measures = _.without(food.alt_measures, measure);
        }
      });

      food.alt_measures.unshift(originalMeasure);
      food.alt_measures = _.uniq(food.alt_measures, measure => measure.measure);

      return food;
    }

    function changeFoodMeasure(food, measure, inPlace) {
      let newFood = nixTrackUtils.multiplyFoodNutrients(
        food, measure.serving_weight / food.serving_weight_grams, inPlace
      );

      newFood.serving_qty = measure.qty;
      newFood.serving_unit = measure.measure;
      newFood.serving_weight_grams = measure.serving_weight;

      normalizeFoodMeasures(newFood);

      return newFood;
    }

    function changeFoodQuantity(food, quantity) {
      nixTrackUtils.multiplyFoodNutrients(food, nixTrackUtils.calculateFoodMultiplier(food, quantity), true);
      normalizeFoodMeasures(food);
    }

    return {
      formatTemplateUrl:   formatTemplateUrl,
      cleanUrl:            cleanUrl,
      roundingCaloriesFDA: roundingCaloriesFDA,
      cleanWords:          cleanWords,
                           normalizeFoodMeasures,
                           changeFoodMeasure,
                           changeFoodQuantity
    };
  }
})();
