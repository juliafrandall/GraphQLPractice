(function () {
  'use strict';

  function gcd(a, b) {
    if (b) {
      return gcd(b, a % b);
    } else {
      return Math.abs(a);
    }
  }

  angular
    .module('nutritionix')
    .filter('smartNumber', function ($filter) {

      return function (number, findSimpleFraction, noCommas, maxFractions, defaultToZero = true) {
        var fractions = 0, multiplier = 1, tmp, result, greatestCommonDenominator;

        tmp = parseFloat(number);

        if (_.isNaN(tmp)) {
          if (defaultToZero) {
            tmp = 0;
          } else {
            return number;
          }
        }

        number = tmp;

        if (number !== 0 && number < 1) {
          do {
            fractions += 1;
            tmp *= 10;
          } while (tmp < 1);
        }

        fractions += 2;

        if ((maxFractions || maxFractions === 0) && fractions > maxFractions) {
          fractions = maxFractions;
        }

        result = $filter('number')(number, fractions)
          // get rid of trailing zeroes
          .replace(/^(.+\.[0-9]*?)0+$/, "$1")
          // and trailing dot if it left alone
          .replace(/\.$/, '');

        // now we will try to determine if this is a simple fraction
        tmp = parseFloat(result.replace(/,/g, ''));
        if (findSimpleFraction !== false && tmp >= 0.25 && tmp < 1) {
          do {
            multiplier *= 10;
            tmp = (10 * tmp).toFixed(6);
          } while (tmp - parseInt(tmp) > 0);

          greatestCommonDenominator = gcd(tmp, multiplier);

          if (greatestCommonDenominator > 1 && multiplier / greatestCommonDenominator < 8) {
            return tmp / greatestCommonDenominator + '/' + multiplier / greatestCommonDenominator;
          }
        }

        if (noCommas) {
          result = result.replace(/,/g, '');
        }

        return result;
      };
    });

}());
