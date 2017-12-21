'use strict';

/**
 * @ngdoc directive
 * @name nutritionix.directive:nutritionLabel
 * @description
 * # nutritionLabel
 */
angular.module('nutritionix')
  .directive('nutritionLabel-legacy', function (user) {
    return {
      restrict: 'A',
      template: `
        <div>
          <div class="label-container"></div>
          <div class="label-mode-switch">
            FDA Label Style:
            <label class="radio-inline">
              <input type="radio" name="labelMode" value="2018" ng-model="vm.labelMode"> 2018 Version
            </label>
            <label class="radio-inline">
              <input type="radio" name="labelMode" value="legacy" ng-model="vm.labelMode"> Legacy Version
            </label>
          </div>
        </div>
      `,
      scope:    {
        item:             '=nutritionLabel',
        onQuantityChange: '=?'
      },
      link:     function postLink(scope, element, attributes) {
        let labelContainer = element.find('.label-container');
        scope.vm           = {
          labelMode: 'legacy'
        };

        function drawLabel() {
          var label;
          labelContainer.html('');
          if (scope.item) {
            label = angular.element('<div>').attr('id', 'label-' + Math.random().toString(36).substring(2));
            label.appendTo(labelContainer);

            label.nutritionLabel({
              showLegacyVersion:                 scope.vm.labelMode === 'legacy',
              userFunctionOnQuantityChange:  scope.onQuantityChange,
              'width':                           attributes.width || 283,
              'itemName':                        scope.item.item_name,
              'brandName':                       scope.item.brand_name,
              'scrollLongItemNamePixel':         38,
              'decimalPlacesForQuantityTextbox': 2,

              //to show the 'amount per serving' text
              'showAmountPerServing': angular.isUndefined(scope.item.showAmountPerServing) && true ||
                                      scope.item.showAmountPerServing,
              //to enable rounding of the numerical values based on the FDA rounding rules
              //http://goo.gl/RMD2O
              'allowFDARounding':     angular.isUndefined(scope.item.allowFDARounding) && true ||
                                      scope.item.allowFDARounding,

              //to show the ingredients value or not
              'showIngredients': false,

              //to show the 'servings per container' data and replace the default 'Serving Size' value (without unit and servings per container text and value)
              showServingsPerContainer: false,

              //these values can be change to hide some nutrition values
              showServingUnitQuantity:        angular.isUndefined(scope.item.showServingUnitQuantity) && true ||
                                              scope.item.showServingUnitQuantity,
              showServingUnitQuantityTextbox: angular.isUndefined(scope.item.showServingUnitQuantityTextbox) && true ||
                                              scope.item.showServingUnitQuantityTextbox,
              showItemName:                   angular.isUndefined(scope.item.showItemName) && true ||
                                              scope.item.showItemName,
              showBrandName:                  scope.item.showBrandName,

              showCalories:      scope.item.calories !== null,
              'showFatCalories': scope.item.calories !== null,
              'showTotalFat':    scope.item.total_fat !== null,
              'showSatFat':      scope.item.saturated_fat !== null,
              'showTransFat':    angular.isUndefined(scope.item.showTransFat) && true ||
                                 scope.item.showTransFat,
              'showPolyFat':     false,
              'showMonoFat':     false,
              'showCholesterol': scope.item.cholesterol !== null,
              'showSodium':      scope.item.sodium !== null,
              'showTotalCarb':   scope.item.total_carb !== null,
              'showFibers':      scope.item.dietary_fiber !== null,
              'showSugars':      scope.item.sugars !== null,
              'showProteins':    scope.item.protein !== null,
              'showVitaminA':    scope.item.vitamin_a !== null,
              'showVitaminC':    scope.item.vitamin_c !== null,
              'showCalcium':     scope.item.calcium_dv !== null,
              'showIron':        scope.item.iron_dv !== null,
              'showPotassium':   !!scope.item.showPotassium,

              //'valueServingPerContainer': 1, //?
              'valueServingUnitQuantity': scope.item.serving_qty,
              'valueServingSizeUnit':     scope.item.serving_unit,
              'valueServingWeightGrams':  scope.item.metric_qty || scope.item.serving_weight_grams,

              'valueCalories':    scope.item.applyOrdinaryRounding ? _.round(scope.item.calories) : scope.item.calories,
              'valueFatCalories': scope.item.applyOrdinaryRounding ? _.round(scope.item.total_fat * 9) : scope.item.total_fat * 9,
              'valueTotalFat':    scope.item.total_fat,
              'valueSatFat':      scope.item.saturated_fat,
              'valueTransFat':    scope.item.trans_fat,
              //'valuePolyFat':             scope.item.?,
              //'valueMonoFat':             scope.item.?,
              'valueCholesterol': scope.item.cholesterol,
              'valueSodium':      scope.item.sodium,
              'valueTotalCarb':   scope.item.total_carb,
              'valueFibers':      scope.item.dietary_fiber,
              'valueSugars':      scope.item.sugars,
              'valueProteins':    scope.item.protein,
              'valueVitaminA':    scope.item.vitamin_a_dv,
              'valueVitaminC':    scope.item.vitamin_c_dv,
              'valueCalcium':     scope.item.calcium_dv,
              'valueIron':        scope.item.iron_dv,
              'valuePotassium':   scope.item.potassium,

              valuePotassium_2018: scope.item.potassium_dv,
              showPotassium_2018:  _.isUndefined(scope.item.showPotassium_2018) ?
                                     !_.isUndefined(scope.item.potassium_dv) :
                                     scope.item.showPotassium_2018,

              valueVitaminD: scope.item.vitamin_d_dv,
              showVitaminD:  _.isUndefined(scope.item.showVitaminD) ?
                               !_.isUndefined(scope.item.vitamin_d_dv) :
                               scope.item.showVitaminD,

              valueAddedSugars: scope.item.valueAddedSugars,
              showAddedSugars:  _.isUndefined(scope.item.showAddedSugars) ?
                                  !_.isUndefined(scope.item.valueAddedSugars) :
                                  scope.item.showAddedSugars,


              'calorieIntake': scope.item.calorieIntake || user.getIsAuthenticated() && user.get('daily_kcal') || 2000
            });
          }
        }


        scope.$watchCollection('item', drawLabel);
        scope.$watch('vm.labelMode', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            drawLabel();
          }
        });
      }
    };
  });
