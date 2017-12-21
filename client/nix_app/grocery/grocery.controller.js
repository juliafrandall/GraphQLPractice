(function () {
  'use strict';

  angular
    .module('grocery')
    .controller('groceryCtrl', groceryCtrl);

  function groceryCtrl($scope, results, $stateParams, ServicesFactory, $state, $filter) {
    //
    // VARIABLES
    //
    var vm = this;

    vm.tagname = $stateParams.tagname;
    vm.parent_tag = results.parent_tag_name;
    vm.child_tag = results.tag_name;
    vm.services = ServicesFactory;

    var params = {
      parent_tag: $filter('cleanurl')(results.parent_tag_name),
      child_tag: $filter('cleanurl')(results.tag_name),
      id: results.tag_id
    };

    $state.go('site.grocery', params, {notify:false, reload:false});

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

        if (results && results.items) {
          return _.pick(nutrients, function (name, nutrient) {
            var items = _.filter(results.items, function (item) {
              return (parseFloat(item['ratio_' + nutrient]) || 0) > 0;
            });

            return items.length >= results.items.length / 2;
          });
        }

        return nutrients;
      }()),
      reset: function () {
        var attribute = this.getAttribute();

        vm.data = angular.copy(results);
        vm.data.items = _(results.items)
          .map(function (item) {
            if (!item[attribute]) {
              item[attribute] = 0;
            }

            return item;
          })
          .sortBy(function (item) {
            return parseFloat(item[attribute]);
          })
          .value();

        this.range.define();
        this.populateChartData();
      },
      populateChartData: function () {
        if (vm.data && vm.data.items) {
          this.data = [
            [],
            []
          ];

          _(vm.data.items).pluck(this.getAttribute()).forEach(function (value) {
            if (value >= vm.chart.min / 1000 && value <= vm.chart.max / 1000) {
              vm.chart.data[0].push(value);
              vm.chart.data[1].push(0);
            } else {
              vm.chart.data[1].push(value);
              vm.chart.data[0].push(0);
            }
          }).value();
          this.labels = _.map(this.data[0], function () {
            return '';
          });
        }
      },
      labels: [],
      data: [],
      getLegend: function (prefix, suffix) {
        return (prefix || '') + this.nutrients[this.nutrient] + (suffix || '');
      },
      range: {
        min: 0,
        max: 0,
        define: function () {
          var values, attribute = vm.chart.getAttribute();
          if (results && results.items) {
            values = _(results.items).map(function (item) {
              return parseFloat(item[attribute] || 0);
            }).sortBy(function (value) {return value;}).value();

            vm.chart.range.min = vm.chart.min = values[0] * 1000;
            vm.chart.range.max = vm.chart.max = values[values.length - 1] * 1000;
          }
        }
      },
      min: 0,
      max: 0

    };
    if (!vm.chart.nutrients[vm.chart.nutrient]) {
      vm.chart.nutrient = _.keys(vm.chart.nutrients)[0];
    }

    vm.chart.reset();

    $scope.$watch(function () {
      return vm.chart.min.toString() + '.' + vm.chart.max.toString();
    }, function () {
      vm.chart.populateChartData();
    });

    vm.getItems = function () {
      var attribute = vm.chart.getAttribute();
      if (results && results.items) {
        return _.filter(results.items, function (item) {
          return item[attribute] >= vm.chart.min / 1000 && item[attribute] <= vm.chart.max / 1000;
        });
      }
    };

    vm.backgroundImage = _(vm.getItems()).filter(function (item) { return !item.has_default_package_url; })
      .sample().package_url;
  }

})();
