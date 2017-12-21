(function () {
  'use strict';

  angular.module('labs.twitter')
    .filter('highlight', function ($sce, $filter) {
      return function (text, phrases) {
        if (!angular.isArray(phrases)) {
          phrases = [phrases];
        }

        phrases = $filter('filter')(phrases, function (value) {
          return !!value;
        });

        phrases = $filter('orderBy')(phrases, function (phrase) {
          return phrase && phrase.length || 0;
        }, true);

        angular.forEach(phrases, function (phrase) {
          phrase = phrase && phrase.toString && phrase.toString() || '';

          if (phrase) {
            text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
              '<span class="highlighted">$1</span>');
          }
        });

        return $sce.trustAsHtml(text)
      }
    })
}());
