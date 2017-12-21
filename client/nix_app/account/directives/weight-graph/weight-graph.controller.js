(function () {
  'use strict';

  angular.module('account')
    .controller('WeightGraphController', function ($scope, $rootScope, nixTrackApiClient, moment, user, $filter) {
      let vm = this;

      const maxPoints = $scope.maxPoints || 12;

      vm.dateTimeFormat  = 'YYYY-MM-DD HH:mm:ss';
      vm.dayDateFormat   = 'YYYY-MM-DD';
      vm.monthDateFormat = 'YYYY-MM';

      vm.measureSystem = user.get('measure_system');
      vm.weightUnit    = vm.measureSystem ? 'kg' : 'lb';

      vm.interval  = 0;
      vm.intervals = [
        'Last 7 days',
        'Last 30 days',
        'This Month',
        'Last Month',
        'Last 3 Months',
        'Last 6 Months',
        'Since Starting Weight',
      ];

      vm.stats = {
        startValue: '',
        endValue:   '',
        endText:    '',
        change:     ''
      };

      vm.setInterval = () => {
        switch (vm.interval) {
          case 1:
            vm.begin.value = moment().startOf('day').subtract(30, 'day').toDate();
            vm.end.value   = moment().startOf('day').toDate();
            break;
          case 2:
            vm.begin.value = moment().startOf('month').toDate();
            vm.end.value   = moment().startOf('day').toDate();
            break;
          case 3:
            vm.begin.value = moment().subtract(1, 'month').startOf('month').toDate();
            vm.end.value   = moment(vm.begin.value).endOf('month').toDate();
            break;
          case 4:
            vm.begin.value = moment().subtract(3, 'month').toDate();
            vm.end.value   = moment().startOf('day').toDate();
            break;
          case 5:
            vm.begin.value = moment().subtract(6, 'month').toDate();
            vm.end.value   = moment().startOf('day').toDate();
            break;
          case 6:
            vm.begin.value = null;
            vm.end.value   = moment().startOf('day').toDate();
            break;
          default:
            vm.begin.value = moment().startOf('day').subtract(7, 'day').toDate();
            vm.end.value   = moment().startOf('day').toDate();
            break;
        }

        vm.loadWeights();
      };

      vm.setCustomInterval = () => {
        vm.interval = '';

        vm.loadWeights();
      };

      vm.begin = {
        minDate: null,
        maxDate: moment().startOf('day').toDate(),
        value:   moment().add(-7, 'day').startOf('day').toDate(),
        opened:  false
      };

      vm.begin.initialValue = vm.begin.value;

      vm.end = {
        minDate: null,
        maxDate: moment().startOf('day').toDate(),
        value:   moment().startOf('day').toDate(),
        opened:  false
      };

      vm.end.initialValue = vm.end.value;

      // Line Chart

      vm.chartLineOptions = {
        maintainAspectRatio: false,
        responsive:          true,
        tooltips:            {
          callbacks: {
            label: (tooltipItem, data) =>
                   data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + ' ' + vm.weightUnit
          }
        }
      };

      vm.chartLineColours = ['#494750'];

      let timezone   = user.getTimezone();
      vm.loadWeights = () => {
        let begin = vm.begin.value ? moment(vm.begin.value).format(vm.dateTimeFormat) : undefined;
        let end   = moment(vm.end.value).endOf('day').format(vm.dateTimeFormat);

        (function fetch(weights = [], limit = 500, offset = 0) {
          return nixTrackApiClient('/weight/log', {params: {timezone, begin, end, limit, offset}})
            .then(response => {
              weights = weights.concat(response.data.weights);

              if (response.data.weights.length === limit) {
                return fetch(weights, limit, offset + limit);
              }

              return weights;
            })
        }())
          .then(function (weights) {
            let dates  = {};
            vm.weights = weights;

            let months, dateFormat, labelDateFormat;

            if (weights.length) {
              let allTimestamps = weights.map(w => w.timestamp);
              let minTimestamp  = _.min(allTimestamps, t => moment(t).unix());
              let maxTimestamp  = _.max(allTimestamps, t => moment(t).unix());
              months            = _.round(moment(maxTimestamp).diff(minTimestamp, 'month', true), 0);
            } else {
              months = 0;
            }

            if (months < 4) {
              dateFormat      = vm.dayDateFormat;
              labelDateFormat = 'MMM DD';
            } else if (months <= 12) {
              dateFormat      = vm.monthDateFormat;
              labelDateFormat = 'MMMM';
            } else {
              dateFormat      = vm.monthDateFormat;
              labelDateFormat = "MMMM 'YY";
            }

            weights.forEach(weight => {
              let date = moment(weight.timestamp).format(dateFormat);
              if (!dates[date]) {
                dates[date] = [];
              }

              dates[date].push(weight.kg);

              if (!dates[date].first || dates[date].first.timestamp > weight.timestamp) {
                dates[date].first = weight;
              }

              if (!dates[date].mostRecent || dates[date].mostRecent.timestamp < weight.timestamp) {
                dates[date].mostRecent = weight;
              }
            });


            let datesKeys = _.keys(dates).sort();

            _.forEach(dates, (weights, date) => {
              if (date === datesKeys[0]) {
                dates[date] = weights.first.kg;
              } else if (date === datesKeys[datesKeys.length - 1]) {
                dates[date] = weights.mostRecent.kg;
              } else {
                dates[date] = _.sum(weights) / weights.length;
              }
            });

            if (datesKeys.length > maxPoints) {
              let intervalLength = (datesKeys.length - 2) / (maxPoints - 2);
              let tmp            = [];

              for (let i = 1; i <= (maxPoints - 2); i += 1) {
                let startIndex = 1 + (i - 1) * intervalLength;
                let endIndex   = 1 + i * intervalLength;

                let index = (startIndex + endIndex) / 2;

                index = _[i <= (maxPoints - 2) / 2 ? 'ceil' : 'floor'](index);

                tmp.push(datesKeys[index]);
              }

              tmp.unshift(datesKeys[0]);
              tmp.push(datesKeys[datesKeys.length - 1]);

              datesKeys = _.uniq(tmp);
            }

            vm.chartLineLabels = [];
            vm.chartLineCharts = [[]];

            vm.datesKeys = datesKeys;

            datesKeys.forEach(date => {
              vm.chartLineLabels.push(moment(date).format(labelDateFormat));
              vm.chartLineCharts[0].push(_.round($filter('kgToUserUnits')(dates[date]), 1));
            });

            vm.stats.startValue = dates[datesKeys[0]];
            vm.stats.endValue   = dates[datesKeys[datesKeys.length - 1]];
            vm.stats.endText    = moment(vm.end.value).format(dateFormat) === moment().format(dateFormat) ?
              'Current' : 'End';

            vm.stats.change           = _.round(vm.stats.endValue - vm.stats.startValue, 1);
            vm.stats.changePercentage = vm.stats.change / vm.stats.startValue * 100;


            // if (vm.weights.length) {
            //   vm.weights.avg = _.sum(vm.weights.map(w => w.kg)) / vm.weights.length;
            // }
          })
      };

      vm.clickHandler = function (points) {
        let point = points[0];

        if (point) {
          let date = vm.datesKeys[point._index];

          $rootScope.$broadcast('track:viewDate-changed', moment(date).format(vm.dayDateFormat));
          $scope.$apply();
        }
      };

      vm.loadWeights();

      ['track:weight-saved', 'track:weight-deleted'].forEach(event => {
        $scope.$on(event, () => {vm.loadWeights();});
      });
    })
    .directive('weightGraph', function () {
      return {
        controller:  'WeightGraphController as vm',
        scope:       {
          maxPoints: '=?'
        },
        templateUrl: '/nix_app/account/directives/weight-graph/weight-graph.html'
      }
    });
}());
