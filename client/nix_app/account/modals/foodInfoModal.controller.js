(function () {
  'use strict';

  angular
    .module('account')
    .controller('foodInfoModalCtrl', foodInfoModalCtrl);

  function foodInfoModalCtrl($scope, $modalInstance, food, goBack, user, $filter) {
    const vm = $scope.vm = this;

    vm.user = user.getUserProfile();

    vm.food = food;

    vm.goBack = () => {
      $modalInstance.close();
      goBack();
    };

    vm.getBurnTime = mets => vm.food.nf_calories / (mets * (vm.user.weight_kg || 63.64)) * 60;
    vm.labelData   = $filter('trackFoodToLabelData')(vm.food, {
      showServingUnitQuantityTextbox: false
    });

    vm.food.alcohol = $filter('nutrient')(vm.food.full_nutrients, 221, 'value') || 0;

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

    vm.pieChart.estimateAlcohol();
    vm.pieChart.normaliseData();
  }
})();
