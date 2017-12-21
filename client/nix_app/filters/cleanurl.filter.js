(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('cleanurl', function () {
      return function (string) {
        return _.trim(string || '')
          .replace(/(\d+\/\d+)/, simpleFraction => {
            let [nominator, denominator] = simpleFraction.split('/');
            return _.round(nominator / denominator, 2)
          })
          .replace(/[^.\w'+]/g, '-')
          .replace(/([^\d]\.|\.[^\d])/g, s => s.replace('.', '-'))
          .toLowerCase()
          .replace(/'/g, '')
          .replace(/-+/g, '-')
          .replace(/-+$/, '')
          .replace(/^-+/, '');
      }
    });

}());
