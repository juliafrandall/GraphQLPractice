(function () {
  'use strict';

  angular
    .module('items')
    .controller('itemsDetailCtrl', itemsDetailCtrl);

  function itemsDetailCtrl($scope, item, tagData, ServicesFactory,
                           $modal, $state, $filter, Analytics, $location, nixTrackUtils,
                           user, restaurantsCalculatorData) {
    var vm = this, params;

    if (!item) {
      $state.go('site.404');
      return;
    }

    vm.calculatorBrand = _.find(restaurantsCalculatorData, {brand_id: item.brand_id});

    vm.pieChart = {
      showAlcohol:     false,
      labels:          ['Protein', 'Carbohydrate', 'Fat'],
      data:            [
        _.round(item.protein * 4 / item.calories * 100, 0),
        _.round(item.total_carb * 4 / item.calories * 100, 0),
        _.round(item.total_fat * 9 / item.calories * 100, 0)
      ],
      normaliseData:   function () {
        let pieSum = _.sum(this.data);

        if (pieSum > 100) {
          this.data[this.data.indexOf(_.max(this.data))] -= pieSum - 100;
        }
      },
      estimateAlcohol: function () {
        let totalCalPercentage = _.sum(this.data);

        if (totalCalPercentage <= 85) {
          this.labels.push('Alcohol*');
          this.data.push(100 - totalCalPercentage);

          this.showAlcohol = true;
        }
      },
      generateLabels:  function (chart) {
        var data = chart.data;
        if (data.labels.length && data.datasets.length) {
          return data.labels.map(function (label, i) {
            var meta = chart.getDatasetMeta(0);
            var ds = data.datasets[0];
            var arc = meta.data[i];
            var custom = arc.custom || {};
            var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
            var arcOpts = chart.options.elements.arc;
            var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
            var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
            var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

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

    vm.pieChart.estimateAlcohol();
    vm.pieChart.normaliseData();

    params = {
          brand: $filter('cleanurl')(item.brand_name),
          item_name: $filter('cleanurl')(item.item_name),
          item_id: item.item_id
        };

    if (!item.updated_at) {
      item.updated_at = item.created_at;
    }

    vm.item = item;
    vm.labelData = $filter('dbItemToLabelData')(item);
    vm.tagData = tagData && angular.copy(tagData.data);

    if (!item.thumbnail && item.tag_image) {
      item.thumbnail = item.tag_image;
    }

    if (!item.thumbnail && vm.tagData && vm.tagData.tag_image) {
      item.thumbnail = vm.tagData.tag_image;
    }

    if (!item.thumbnail && item.item_type === 1 && item.brand_logo) {
      item.thumbnail = item.brand_logo;
    }

    if (item.item_type === 2) {
      item.thumbnail_title = `${item.item_name} by ${item.brand_name}`;
    } else if (item.item_type === 3 && item.tag_name) {
      item.thumbnail_title = $filter('ucfirst')($filter('pluralize')(item.tag_name));
    } else {
      item.thumbnail_title = item.item_name;
    }

    vm.productURL = $location.absUrl();

    if (item.recipe) {
      var recipeFactor = vm.item.metric_qty / vm.item.recipe.total_weight;
      _.forEach(item.recipe.ingredients, function (ingredient) {
        ingredient.serving_qty *= recipeFactor;
        ingredient.serving_weight *= recipeFactor;
        ingredient.calories *= recipeFactor;
      });
    }

    $state.go('site.itemsDetail', params, {notify:false, reload:false});

    vm.chart = {
      nutrient: 'calories',
      getAttribute: function () {
        return 'ratio_' + this.nutrient;
      },
      nutrients: (function () {
        var nutrients = {
          protein:  'Protein',
          calories: 'Calories',
          carb:     'Carbohydrate',
          sodium:   'Sodium',
          fat:      'Fat',
          sugars:   'Sugars'
        };

        if (tagData && tagData.data && tagData.data.items) {
          return _.pick(nutrients, function (name, nutrient) {
            var items = _.filter(tagData.data.items, function (item) {
              return (parseFloat(item['ratio_' + nutrient]) || 0) > 0;
            });

            return items.length >= tagData.data.items.length / 2;
          });
        }

        return nutrients;
      }()),
      reset: function () {
        var attribute = this.getAttribute();

        vm.tagData = angular.copy(tagData.data);

        if (!_.find(tagData.data.items, {
            item_id: item.item_id
          })) {
          tagData.data.items.push(item);
        }

        vm.tagData.items = _.map(tagData.data.items, function (item) {
          if (!item[attribute]) {
            item[attribute] = 0;
          }

          return item;
        }).sort(function (a, b) {
          if (parseFloat(a[attribute]) < parseFloat(b[attribute]) ||
            a[attribute].toString() === b[attribute].toString() && b.item_id === vm.item.item_id) {
            return -1;
          }
          if (parseFloat(a[attribute]) > parseFloat(b[attribute]) ||
            a[attribute].toString() === b[attribute].toString() && a.item_id === vm.item.item_id) {
            return 1;
          }

          return 0;
        });

        this.populateChartData();
      },
      populateChartData: function () {
        var attribute = this.getAttribute();
        if (vm.tagData && vm.tagData.items) {
          this.data = [
            [],
            []
          ];

          _.forEach(vm.tagData.items, function (tagItem) {
            var value = tagItem[attribute];
            if (tagItem.item_id === item.item_id) {
              vm.chart.data[0].push(value);
              vm.chart.data[1].push(0);
            } else {
              vm.chart.data[1].push(value);
              vm.chart.data[0].push(0);
            }
          });

          this.labels = _.map(this.data[0], function () {
            return '';
          });
        }
      },
      labels: [],
      data: [],
      getLegend: function (prefix, suffix) {
        return (prefix || '') + this.nutrients[this.nutrient] + (suffix || '');
      }
    };

    if (!vm.chart.nutrients[vm.chart.nutrient]) {
      vm.chart.nutrient = _.keys(vm.chart.nutrients)[0];
    }

    if (tagData && vm.item.item_type == 2 && vm.item.metric_qty) {
      vm.chart.reset();

      vm.getX = function () {
        var attribute = vm.chart.getAttribute();
        return _.filter(tagData.data.items, function (item) {
          return item[attribute] > vm.item[attribute];
        }).length / tagData.data.items.length * 100;
      };
    }

    if (tagData) {
      vm.popularInTag = _(tagData.data.items).filter(function (item) {
        return !item.has_default_package_url;
      }).shuffle().slice(0, 3).value();
    }

    vm.onQuantityChange = function (eventType, previousValue, newValue) {
      let event;

      nixTrackUtils.multiplyFoodNutrients(
        vm.trackFood,
        nixTrackUtils.calculateFoodMultiplier(vm.trackFood, newValue),
        true
      );


      switch (eventType) {
        case 'up arrow':
          event = 'Quantity Up Arrow Clicked';
          break;
        case 'down arrow':
          event = 'Quantity Down Arrow Clicked';
          break;
        case 'textbox':
          event = 'Quantity Textbox Value Changed';
          break;
      }

      Analytics.trackEvent('Nutrition Label', event);
    };


    vm.trackFood = {
      'food_name':             item.item_name,
      'brand_name':            item.brand_name,
      'serving_qty':           item.serving_qty,
      'serving_unit':          item.serving_unit,
      'serving_weight_grams':  item.metric_unit === 'g' ? item.metric_qty : null,
      'nf_calories':           item.calories,
      'nf_total_fat':          item.total_fat,
      'nf_saturated_fat':      item.saturated_fat,
      'nf_cholesterol':        item.cholesterol,
      'nf_sodium':             item.sodium,
      'nf_total_carbohydrate': item.total_carb,
      'nf_sugars':             item.sugars,
      'nf_protein':            item.protein,
      'nf_potassium':          item.potassium,
      'upc':                   item.upc,
      'source':                item.item_type === 1 && 3 || item.item_type == 3 && 1 || item.item_type
    };

    vm.trackFood.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(vm.trackFood);
    vm.trackFood.alt_measures = item.item_type === 3
      ? (item.sizes || []).map(size => _.pick(size, ['serving_weight', 'measure', 'seq', 'qty']))
      : null;

    vm.nutrientString = vm.trackFood.full_nutrients.map(nutrient => nutrient.attr_id + ':' + nutrient.value).join(',');


    if (user.getIsAuthenticated()) {
      vm.user = user.getIdentity().user;
    }

    vm.getBurnTime = mets => vm.trackFood.nf_calories / (mets * (vm.user && vm.user.weight_kg || 63.64)) * 60;

  }
})();
