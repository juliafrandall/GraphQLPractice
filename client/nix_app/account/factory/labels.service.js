'use strict';

angular.module('nutritionix')
  .factory('listLabelsService', function ($http, $q) {
    let labelsPromise;

    return {
      get: function () {
        return labelsPromise || (
          labelsPromise = $http
            .get('https://d1gvlspmcma3iu.cloudfront.net/labels.json.gz')
            .then(response => response.data)
        );
      },

      updateListLabelData: function (list) {
        if (list.labels && list.labels.length) {
          return this.get()
            .then(labels => {
              let listLabels = list.labels;
              list.labels    = [];
              listLabels.forEach(label => {
                let labelFreshData = _.find(labels, {id: label.id});
                if (labelFreshData) {
                  list.labels.push(labelFreshData);
                }
              });

              return list;
            });
        }

        return $q.resolve(list);
      }
    };
  });
