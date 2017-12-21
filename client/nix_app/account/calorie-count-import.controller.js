(function () {
  'use strict';

  angular
    .module('account')
    .value('Papa', Papa)
    .controller('AccountCalorieCountImportCtrl', AccountCalorieCountImportCtrl);

  function AccountCalorieCountImportCtrl($scope, Upload, user, Papa, $q) {
    const vm = $scope.vm = this;

    vm.importType = 'foods';

    vm.importTypeLabels = {
      'foods':     'Foods',
      'weightIns': 'Weigh-Ins'
    };

    vm.options = {
      weightIns: {
        units: 'lbs',
      }
    };

    vm.userProfile = user.getUserProfile();

    vm.validate = file => {
      return $q(resolve => {
        if (!file.name.match(/\.csv$/)) {
          resolve('Please upload files in .csv format only');
        }

        Papa.parse(file, {
          preview:  1,
          complete: function (results) {
            let header = results.data[0];
            if (_.isEqual(header, ['day', 'weight', 'comments'])) {
              vm.importType = 'weightIns';
              resolve(true);
            } else if (_.isEqual(header, ["day", "mealtime", "description", "user_defined", "grams", "calories", "fat", "fat_saturated", "fat_trans", "cholesterol", "sodium", "carbs", "sugars", "fiber", "protein", "alcohol", "calcium", "iron", "manganese", "magnesium", "niacin", "panto_acid", "phosphorus", "potassium", "riboflavin", "selenium", "thiamin", "vit_a", "vit_b6", "vit_b12", "vit_c", "vit_d", "vit_e", "zinc"])) {
              vm.importType = 'foods';
              resolve(true);
            } else {
              resolve('Unsupported CSV structure. Only Foods and Weigh-Ins data is supported.');
            }

            $scope.$apply();
          }
        });
      }).then(value => {
        if (_.isString(value)) {
          file.$errorMessage = value;
        }

        return value;
      });
    };

    vm.submit = function () {
      if (vm.form.file.$valid && vm.file) {
        vm.submit.$busy     = true;
        vm.submit.$progress = null;
        vm.submit.$success = null;
        vm.submit.$error   = null;

        Upload.upload({
          url:       '/labsapi/calories-count/import',
          data:      {
            file:         vm.file,
            'x-user-jwt': user.get('jwt'),
            type:         vm.importType,
            profile:      _.pick(
              user.getUserProfile(),
              ['id', 'first_name', 'last_name', 'email', 'timezone']
            ),
            options:      vm.options[vm.importType]
          },
          ignore500: true
        }).then(function (resp) {
            vm.submit.$success = true;
            vm.file            = null;
          }, function (resp) {
            vm.submit.$error = true;
          }, function (evt) {
            vm.submit.$progress = parseInt(100.0 * evt.loaded / evt.total);
          })
          .finally(() => {
            vm.submit.$busy     = false;
            vm.submit.$progress = null;
          });
      }
    };
  }
})();
