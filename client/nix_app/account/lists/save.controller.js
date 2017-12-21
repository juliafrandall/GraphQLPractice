(function () {
  'use strict';

  angular
    .module('account.lists')
    .controller('AccountSaveListCtrl', AccountSaveListCtrl);

  function AccountSaveListCtrl($scope, list, InstantSmartSearch,
                               nixTrackUtils, $filter, nixTrackApiClient,
                               globalAlert, $state, listDuplicator, listFocusNutrients,
                               $http, user, $q, listLabels, $timeout, $window) {
    const vm = $scope.vm = this;

    const normaliseMeasures = food => {
      if (!food.alt_measures) {
        food.alt_measures = [];
      }

      const defaultMeasure = {
        measure:        food.serving_unit === 'g' ? 'grams' : food.serving_unit,
        qty:            _.round(food.serving_qty, 2),
        serving_weight: food.serving_weight_grams ? _.round(food.serving_weight_grams) : food.serving_weight_grams
      };

      const gramsMeasure = food.serving_weight_grams ? {
        measure:        'grams',
        qty:            100,
        serving_weight: 100
      } : null;

      food.alt_measures.forEach(measure => {
        if (measure.measure === 'g') {
          measure.measure = 'grams';
        }
      });

      [defaultMeasure, gramsMeasure].forEach(m => {
        if (m && !_.find(food.alt_measures, {measure: m.measure})) {
          food.alt_measures.unshift(m);
        }
      });

      food.alt_measures.forEach(measure => {
        measure.$user_qty = measure.qty;
      });

      if (!food.$measure) {
        food.$measure = food.$type === 'branded' || food.brand_name || !gramsMeasure ?
          _.find(food.alt_measures, {measure: defaultMeasure.measure}) :
          _.find(food.alt_measures, {measure: gramsMeasure.measure});

        vm.setFoodMeasure(food);
      } else {
        food.$measure = _.find(food.alt_measures, {measure: food.$measure.measure});

        if (food.$measure && food.serving_weight_grams && _.round(food.serving_weight_grams) !== _.round(food.$measure.serving_weight)) {
          vm.setFoodMeasure(food);
        }
      }

      return food;
    };

    vm.isNew = !list;

    vm.nutrients = listFocusNutrients;

    vm.nutrientDefinitions = nutritionixApiDataUtilities.fullNutrientsDefinitions;

    vm.instantSmartSearch = new InstantSmartSearch();
    _.assign(vm.instantSmartSearch.limits, {
      branded:      5,
      categoryView: 5
    });
    vm.instantSmartSearch.logStat = () => {};
    vm.instantSmartSearch.sources = {
      self:    false,
      common:  true,
      branded: false
    };
    vm.instantSmartSearch.source  = 'common';
    $scope.$watch('vm.instantSmartSearch.source', () => {
      ['common', 'branded'].forEach(source => {
        vm.instantSmartSearch.sources[source] = source === vm.instantSmartSearch.source || vm.instantSmartSearch.source === 'all';
      });

      vm.instantSmartSearch.disableTabs = vm.instantSmartSearch.source !== 'all';

      vm.instantSmartSearch.categoryFilter.setCategory(
        {type: vm.instantSmartSearch.source === 'all' ? '' : vm.instantSmartSearch.source}
      );
    });
    $timeout(() => {
      vm.instantSmartSearch.categoryFilter.reset = function () {
        if (vm.instantSmartSearch.source === 'all') {
          this.current = '';
        } else {
          this.current = vm.instantSmartSearch.source;
        }

        this.showAllInCategory = false;
      };

      vm.instantSmartSearch.categoryFilter.categories[4].isVisible = () => false;
    });

    vm.instantSmartSearch.enableSuggestedFoods = false;
    vm.instantSmartSearch.enableFreeform       = true;
    vm.instantSmartSearch.disableTabs          = false;
    vm.instantSmartSearch.loadFoods            = function ($search) {
      return InstantSmartSearch.prototype.loadFoods.call(this, $search)
        .then(() => {
          _.remove(this.items, f => _.find(vm.list.items, i => i.original_food_name === f.food_name || i.food_name === f.food_name));
        })
    };
    vm.instantSmartSearch.processFood          = function (food) {
      if (_.isArray(food)) {
        food = food[0];
      }

      normaliseMeasures(food);

      food.original_food_name = food.food_name;
      vm.list.items.push(food);
    };

    vm.setFoodMeasure = food => {
      if (!parseFloat(food.$measure.$user_qty)) {return}

      let factor = food.$measure.$user_qty / food.$measure.qty;

      if (food.$measure.$user_qty !== food.$measure.qty) {
        if (food.$measure.serving_weight) {
          food.$measure.serving_weight = _.round(food.$measure.serving_weight * factor);
        }

        food.$measure.qty = food.$measure.$user_qty;
      }

      if (food.$measure.serving_weight && food.serving_weight_grams) {
        factor = food.$measure.serving_weight / food.serving_weight_grams;
      }

      nixTrackUtils.multiplyFoodNutrients(food, factor, true);
      food.serving_unit = food.$measure.measure;
      food.serving_qty  = food.$measure.qty;

      vm.sortItems();
    };

    vm.removeItem = (item) => {
      _.pull(vm.list.items, item);
    };

    vm.sortItems = () => {
      let focusedInput = angular.element('.table-food-list input:focus, .table-food-list select:focus');

      vm.list.items = $filter('orderBy')(
        vm.list.items,
        item => vm.nutrients.byId[vm.list.nutrient_focus].getValue(item),
        vm.list.sort === 'DESC'
      );

      $timeout(() => {focusedInput.blur(); focusedInput.focus()});
    };

    vm.list = list || listDuplicator.pull() || {
      name:                 '',
      description:          '',
      sort:                 'ASC',
      nutrient_focus:       208,
      serving_weight_grams: 100,
      items:                [],
      is_published:         1,
      labels:               []
    };

    vm.list.items.forEach(item => normaliseMeasures(item));

    vm.save = () => {
      vm.save.$error   = null;
      vm.save.$success = null;
      vm.save.$busy    = true;

      const groupedItems = _.groupBy(vm.list.items, i => i.food_name);
      for (let i in groupedItems) if (groupedItems.hasOwnProperty(i)) {
        if (groupedItems[i].length > 1) {
          globalAlert.danger(`Duplicate item ${i}`);
          vm.save.$busy = false;
          return;
        }
      }

      let flow = $q.resolve();

      if (!vm.list.description) {
        vm.list.description = null;
      }

      if (vm.isNew) {
        flow = nixTrackApiClient('/public_lists', {
          method: 'POST',
          data:   {public_list: vm.list}
        })
          .then(response => {
            vm.list = response.data;
            return vm.generateImage.submit(vm.list.id);
          })
          .then(photo => {
            if (photo) {
              vm.list.photo = photo;

              return nixTrackApiClient(`/public_lists/${vm.list.id}`, {
                method: 'PUT',
                data:   {public_list: {photo: vm.list.photo}}
              })
                .then(response => vm.list = response.data)
            }
          })
      } else {
        flow = vm.generateImage.submit(vm.list.id)
          .then(photo => {
            if (photo) {
              vm.list.photo = photo;
            }

            return nixTrackApiClient(`/public_lists/${vm.list.id}`, {
              method: 'PUT',
              data:   {public_list: vm.list}
            })
          })
          .then(response => vm.list = response.data)
      }

      flow
        .then(() => {
          if (vm.isNew) {
            $state.go('account.cabinet.lists.edit', {id: vm.list.id});
          } else {
            vm.save.$success = true;

            vm.list.items.forEach(item => normaliseMeasures(item));

            globalAlert.success('List saved');
          }

          $http.put('/nixapi/refresh-cache', {
            url: $state.href(
              'site.listDetail',
              {id: vm.list.id, name: ($filter('cleanurl')(vm.list.name))},
              {absolute: true}
            )
          });
        })
        .catch(response => {
          vm.save.$error = response.data;
          globalAlert.danger('List not saved', 5000);
        })
        .finally(() => vm.save.$busy = false);
    };

    vm.suggestFoodName = query => nixTrackApiClient('/search/instant', {
      params: {
        query,
        branded:  false,
        self:     false,
        common:   true,
        detailed: false
      }
    }).then(response => response.data.common.map(f => f.food_name));

    vm.duplicateList = () => {
      listDuplicator.push(vm.list)
        .then(() => $window.open($state.href('account.cabinet.lists.new')));
    };

    vm.generateImage = () => {
      const image_urls = vm.list.items
        .filter(i => !!(i.photo))
        .slice(0, 4)
        .map(i => i.photo.highres || i.photo.thumb);

      return $http({
        method:            'POST',
        url:               'https://y7xfu029ed.execute-api.us-east-1.amazonaws.com/prod/image',
        data:              {image_urls, max_width: 1200},
        responseType:      'blob',
        transformResponse: function (data, headers) {
          return new Blob([data], {type: headers('content-type')});
        },
        headers:           {
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          vm.generateImage.response = response;
        });
    };

    vm.generateImage.submit = id => {
      if (!vm.generateImage.response) {
        return $q.resolve(null);
      }

      const response = vm.generateImage.response;

      return $http({
        url:     nixTrackApiClient.getApiEndpoint(true) + `/upload/image/public-list/${id}`,
        method:  'POST',
        headers: {
          'Content-Type': response.headers['Content-Type'],
          'x-user-jwt':   user.get('jwt')
        },
        params:  {
          extent:    1,
          full_size: '1200x630'
        },
        data:    response.data
      }).then(response => {
        vm.generateImage.response = null;

        return {
          thumb:   response.data.cdn.thumb,
          highres: response.data.cdn.full
        };
      })
    };

    vm.labels = listLabels;

    $scope.$watchGroup(['vm.list.items.length', 'vm.list.sort', 'vm.list.nutrient_focus'], () => {
      vm.form.$setValidity('items', vm.list.items.length > 0);

      vm.sortItems();
    });
  }
})();
