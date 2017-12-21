(function () {
  'use strict';

  angular.module('account')
    .factory('consumedAt', function ($rootScope, moment, $localStorage) {
      let consumedAt = {
        maxDate:    null,
        now:        null,
        useNow:     null,
        meal:       null,
        day:        null,
        datePicker: null,
        mealTypes: {
          1: 'Breakfast',
          2: 'AM Snack',
          3: 'Lunch',
          4: 'PM Snack',
          5: 'Dinner',
          6: 'Late Snack',
          7: 'Anytime'
        },

        refresh:  function () {
          this.maxDate = moment().endOf('day').toDate();
          this.now = moment();
        },
        reset:    function () {
          this.refresh();
          this.useNow = true;
          this.meal = 'Dinner';
          this.day = 'Today';
          this.datePicker = moment();
        },
        restore:  function () {
          if ($localStorage.consumedAtState) {
            this.useNow = $localStorage.consumedAtState.useNow;
            this.meal = $localStorage.consumedAtState.meal || 'Dinner';
            this.day = $localStorage.consumedAtState.day;
            this.datePicker = moment($localStorage.consumedAtState.datePicker);
          }
        },
        toggle:   function () {
          if (this.useNow) {
            this.setValue(moment());
          } else {
            this.useNow = true;
          }
        },
        getValue: function (returnNow) {
          if (this.useNow) {
            return returnNow ? this.now : undefined;
          }

          let meal = this.meal || 'Dinner';
          let date;

          if (this.day) {
            date = this.now.clone();
            if (this.day === 'Yesterday') {
              date.subtract(1, 'day');
            }
          } else {
            date = moment(this.datePicker).clone();
          }

          date.startOf('day');

          switch (meal) {
            case 'Breakfast':
              date.hours(9);
              break;
            case 'AM Snack':
            case 'Snack':
              date.hours(10);
              break;
            case 'Lunch':
              date.hours(12);
              break;
            case 'PM Snack':
              date.hours(15);
              break;
            case 'Dinner':
              date.hours(17);
              break;
            case 'Late Snack':
              date.hours(21);
              break;
          }

          return date;
        },

        getMeal: function () {
          return this.mealTypes[this.getMealType()];
        },

        getMealType: function () {
          if (this.useNow) {
            let hour = this.now.hours();
            if (hour >= 3 && hour < 11) {
              return 1;
            }
            else if (hour >= 11 && hour < 17) {
              return 3;
            } else {
              return 5;
            }
          }

          switch (this.meal) {
            case 'Breakfast':
              return 1;
            case 'AM Snack':
            case 'Snack':
              return 2;
            case 'Lunch':
              return 3;
            case 'PM Snack':
              return 4;
            case 'Dinner':
              return 5;
            case 'Late Snack':
              return 6;
          }
        },
        setValue:    function (consumedAt, mealType = null) {
          let date = this.datePicker = moment(consumedAt);

          this.refresh();

          this.useNow = false;

          if (date.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
            this.day = 'Today';
          } else if (date.format('YYYY-MM-DD') === moment().subtract(1, 'day').format('YYYY-MM-DD')) {
            this.day = 'Yesterday';
          } else {
            this.day = null;
          }

          if (!mealType) {
            let hours = date.hours();

            if (hours <= 9) {
              mealType = 1;
            } else if (hours <= 11) {
              mealType = 2;
            } else if (hours <= 15) {
              mealType = 3;
            } else if (hours <= 17) {
              mealType = 4;
            } else if (hours <= 21) {
              mealType = 5;
            } else {
              mealType = 6;
            }
          }

          this.meal = this.mealTypes[mealType];
        }
      };

      consumedAt.reset();
      consumedAt.restore();

      $rootScope.$on('track:foods-added', () => {consumedAt.reset();});

      $rootScope.$watch(() => consumedAt.day, day => {
        consumedAt.showDatePicker = !day;
      });

      if (!$localStorage.consumedAtState) {
        $localStorage.consumedAtState = {};
      }

      $rootScope.$watch(() => JSON.stringify({
        useNow:     consumedAt.useNow,
        meal:       consumedAt.meal,
        day:        consumedAt.day,
        datePicker: moment(consumedAt.datePicker).format()
      }), consumedAtState => {
        angular.extend($localStorage.consumedAtState, JSON.parse(consumedAtState));
      });

      return consumedAt;
    })
}());
