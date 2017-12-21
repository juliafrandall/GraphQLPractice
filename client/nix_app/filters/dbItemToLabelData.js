'use strict';

angular.module('nutritionix')
  .filter('dbItemToLabelData', function ($log, user) {

    const defaults = {
      itemName:          'Item',
      brandName:         'Nutritionix',
      allowFDARounding:  false,
      applyMathRounding: true,

      valueServingUnitQuantity: 1,
      valueServingSizeUnit:     'Serving'
    };

    const map = [
      {labelAttribute: 'valueCalories', itemAttribute: 'calories'},
      {labelAttribute: 'valuePhosphorus', itemAttribute: 'phosphorus'},
      {labelAttribute: 'valueCaffeine', itemAttribute: 'caffeine'},
      {labelAttribute: 'valueFatCalories', itemAttribute: 'total_fat', adapter: v => v * 9},
      {labelAttribute: 'valueTotalFat', itemAttribute: 'total_fat'},
      {labelAttribute: 'valueSatFat', itemAttribute: 'saturated_fat'},
      {labelAttribute: 'valueTransFat', itemAttribute: 'trans_fat'},
      {labelAttribute: 'valueCholesterol', itemAttribute: 'cholesterol'},
      {labelAttribute: 'valueSodium', itemAttribute: 'sodium'},
      {labelAttribute: 'valuePotassium', itemAttribute: 'potassium'},
      {labelAttribute: 'valuePotassium_2018', itemAttribute: 'potassium', dailyValue: 3500},
      {labelAttribute: 'valueTotalCarb', itemAttribute: 'total_carb'},
      {labelAttribute: 'valueFibers', itemAttribute: 'dietary_fiber'},
      {labelAttribute: 'valueSugars', itemAttribute: 'sugars'},
      // {labelAttribute: 'valueAddedSugars', attrId: undefined},
      {labelAttribute: 'valueProteins', itemAttribute: 'protein'},
      {labelAttribute: 'valueVitaminA', itemAttribute: 'vitamin_a'},
      {labelAttribute: 'valueVitaminC', itemAttribute: 'vitamin_c'},
      {labelAttribute: 'valueVitaminD', itemAttribute: 'vitamin_d'},
      {labelAttribute: 'valueCalcium', itemAttribute: 'calcium_dv'},
      {labelAttribute: 'valueIron', itemAttribute: 'iron_dv'},
      {labelAttribute: 'ingredientList', itemAttribute: 'ingredient_statement', showAttribute: 'showIngredients'},
    ];

    return function (food, attributes = {}, externalServingQty = 1) {
      let labelData = {};

      labelData.itemName  = (food.item_name || '').replace(/^([a-z])|\s+([a-z])/g, $1 => $1.toUpperCase());
      labelData.brandName = food.brand_name;

      labelData.valueServingUnitQuantity = food.serving_qty;
      labelData.valueServingSizeUnit     = food.serving_unit;
      labelData.valueServingWeightGrams  = food.metric_unit === 'g' ? food.metric_qty / externalServingQty : null;

      map.forEach(definition => {
        let value = food[definition.itemAttribute];
        if (!angular.isUndefined(value) && value !== null) {
          if (angular.isFunction(definition.adapter)) {
            value = definition.adapter(value);
          }

          if (externalServingQty && externalServingQty !== 1) {
            value = value / externalServingQty;
          }

          if (definition.dailyValue) {
            value = 100 / definition.dailyValue * value;
          }

          labelData[definition.labelAttribute]                          = value;
          labelData[definition.showAttribute || definition.labelAttribute.replace('value', 'show')] = true;
        } else {
          labelData[definition.showAttribute || definition.labelAttribute.replace('value', 'show')] = false;
        }
      });

      angular.extend(labelData, attributes);
      angular.forEach(defaults, (value, key) => {
        if (angular.isUndefined(labelData[key])) {
          labelData[key] = value;
        }
      });

      $log.debug('dbFoodToLabelData', labelData);

      return labelData;
    }
  });
