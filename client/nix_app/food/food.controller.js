(function () {
  'use strict';

  angular
    .module('food')
    .controller('foodCtrl', foodCtrl);

  function foodCtrl($scope, item, $state, $filter, Analytics, $location, nixTrackUtils, user, ServicesFactory) {
    const vm = this;

    if (!item) {
      if ($state.params.serving) {
        $state.go($state.current.name, {
          raw:           $state.params.raw,
          natural_query: $state.params.natural_query,
          serving:       null
        })
      } else {
        $state.go('site.404');
      }

      return;
    }

    item.alcohol = $filter('nutrient')(item.full_nutrients, 221, 'value') || 0;

    let totalCalForPieChart = _.max([
      item.nf_calories,
      item.nf_protein * 4 + item.nf_total_carbohydrate * 4 + item.nf_total_fat * 9 + item.alcohol * 7
    ]);

    vm.pieChart = {
      showAlcohol:     false,
      labels:          ['Protein', 'Carbohydrate', 'Fat'],
      data:            [
        _.round(item.nf_protein * 4 / totalCalForPieChart * 100, 0),
        _.round(item.nf_total_carbohydrate * 4 / totalCalForPieChart * 100, 0),
        _.round(item.nf_total_fat * 9 / totalCalForPieChart * 100, 0)
      ],
      normaliseData:   function () {
        let pieSum = _.sum(this.data);

        if (pieSum > 100) {
          this.data[this.data.indexOf(_.max(this.data))] -= pieSum - 100;
        }
      },
      estimateAlcohol: function () {
        let alcoholPercentage;
        if (item.alcohol) {
          alcoholPercentage = _.round(item.alcohol * 7 / totalCalForPieChart * 100, 0);
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

    vm.pieChart.estimateAlcohol();
    vm.pieChart.normaliseData();

    if (!item.updated_at) {
      item.updated_at = item.created_at;
    }

    vm.item = item;

    vm.productURL = $location.absUrl();

    vm.onQuantityChange = function (eventType, previousValue, newValue) {
      let event;

      nixTrackUtils.multiplyFoodNutrients(
        vm.trackFood,
        nixTrackUtils.calculateFoodMultiplier(vm.trackFood, newValue),
        true
      );

      ServicesFactory.normalizeFoodMeasures(vm.trackFood);

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


    vm.trackFood = nixTrackUtils.copyFood(item);

    if (user.getIsAuthenticated()) {
      vm.user = user.getIdentity().user;
    }

    vm.getBurnTime = mets => vm.trackFood.nf_calories / (mets * (vm.user && vm.user.weight_kg || 63.64)) * 60;

    vm.labelData = $filter('trackFoodToLabelData')(item);
  }
})();
