(function () {
  "use strict";

  angular.module('account')
    .run(function ($templateCache) {
      $templateCache.put(
        "track/choices.tpl.html",
        `<ul class="ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu" 
             role="listbox" 
             ng-show="$select.open && $select.items.length > 0">
             <li class="smart-search-tabs" ng-show="$select.search && !smartSearch.disableTabs">
               <ul>
                 <li class="clickable"
                     ng-class="{active: categoryFilter.current === category.type}" 
                     ng-repeat="category in categoryFilter.categories"
                     ng-click="categoryFilter.setCategory(category)"
                     ng-if="!category.isVisible || category.isVisible()">
                  {{category.label}}
                 </li>
               </ul>
             </li>
             <li class="ui-select-choices-group" 
                 id="ui-select-choices-{{ $select.generatedId }}">
                 <div class="divider" ng-show="$select.isGrouped && $index > 0"></div>
                 <div ng-show="$select.isGrouped" class="ui-select-choices-group-label dropdown-header" 
                      ng-bind="$group.name"></div>
                 <div ng-attr-id="ui-select-choices-row-{{ $select.generatedId }}-{{$index}}" 
                      class="ui-select-choices-row" 
                      ng-class="{active: $select.isActive(this), disabled: $select.isDisabled(this)}" 
                      role="option">
                   <a href class="ui-select-choices-row-inner"></a>
                 </div>
             </li>
             <li class="more clickable" 
              ng-click="categoryFilter.showAll()"
              ng-show="!categoryFilter.showAllInCategory && categoryFilter.current && smartSearch.groupedItems[categoryFilter.current].length > smartSearch.limits.categoryView">
              More...
             </li>
         </ul>`
      );

      [
        'match-multiple.tpl.html', 'match.tpl.html', 'no-choice.tpl.html',
        'select-multiple.tpl.html', 'select.tpl.html'
      ].forEach(tpl => $templateCache.put(`track/${tpl}`, $templateCache.get(`bootstrap/${tpl}`)));
    })
    .factory('InstantSmartSearch', function (nixTrackApiClient, reviewFoodsBasket, $q,
                                             nixTrackUtils, user, consumedAt, moment,
                                             debounce, $http, globalAlert) {
      function SmartSearch() {
        this.items    = [];
        this.selected = null;

        this.sources = {
          self:    true,
          common:  true,
          branded: true
        };

        this.limits = {
          suggested:    10,
          self:         3,
          common:       5,
          branded:      3,
          categoryView: 10
        };

        this.showCounters = true;

        this.enableFreeform       = true;
        this.enableSuggestedFoods = true;
        this.defaultToInput       = false;

        this.suggestedMealTypes = undefined;
      }

      SmartSearch.prototype.select = function (food) {
        this.selected = null;
        this.error    = null;

        this.logStat(food);

        let promise;

        if (food.$type === 'phrase' || food.$type === 'freeform') {
          promise = nixTrackApiClient.natural.nutrients({query: food.food_name, timezone: user.getTimezone()});

          promise
          .then(response => {
            let data = response.data;

            if (data.foods.length > 0) {
              data.foods.forEach(trackFood => trackFood.$type = food.$type);

              if (food.$type === 'freeform') {
                if (Math.abs(data.foods[0].consumed_at && moment().diff(moment(data.foods[0].consumed_at), 'hours')) > 0) {
                  consumedAt.setValue(data.foods[0].consumed_at);
                }

                this.processFood(data.foods);
              } else {
                this.processFood(data.foods[0]);
              }
            }
          })
          .catch(response => {
            if (response.status === 404) {
              globalAlert.danger(`No foods found`, 2000);
            } else {
              return $q.reject(response);
            }
          });
        } else if (food.$type === 'history') {
          promise = nixTrackApiClient(`/log/${food.uuid}/detailed`)
            .success(data => {
              let trackFood   = data.foods[0];
              trackFood.$type = food.$type;
              this.processFood(trackFood);
            });
        } else if (food.$type === 'suggested') {
          let trackFood   = nixTrackUtils.copyFood(food);
          trackFood.$type = food.$type;
          this.processFood(trackFood);
          return;
        } else if (food.$type === 'branded') {
          promise = nixTrackApiClient(`/search/item/`, {params: {nix_item_id: food.nix_item_id}})
            .then(response => {
              let trackFood   = response.data.foods[0];
              trackFood.$type = food.$type;
              this.processFood(trackFood);
            });
        }

        promise.catch(response => {
          this.error = response.data;

          globalAlert.danger('Could not add food :( Please <a href="/contact">contact support</a>', 2000);
        });
      };

      SmartSearch.prototype.processFood = function (food) {
        reviewFoodsBasket.push(food);
        reviewFoodsBasket.openModal();
      };

      SmartSearch.prototype.loadFoods = function ($select/*, $event*/) {
        let search = this.$search = $select.search;

        if (!$select.search) {
          if (this.enableSuggestedFoods) {
            let mealTypes = undefined;

            if (this.suggestedMealTypes) {
              mealTypes = this.suggestedMealTypes;
              if (!angular.isArray(mealTypes)) {
                mealTypes = [mealTypes];
              }

              mealTypes = JSON.stringify(mealTypes);
            }

            return nixTrackApiClient('/reports/suggested', {
              params:           {
                timezone:   user.getTimezone(),
                meal_types: mealTypes
              },
              ignoreLoadingBar: true,
            })
              .then(response => response.data)
              .then(data => {
                if (this.$search !== search) {return;}

                let items    = [];
                let category = `Foods eaten around ${moment().format('hA')}`;
                data.foods = data.foods.slice(0, this.limits.suggested);
                data.foods.forEach(food => {
                  food.$category = category;
                  food.$type     = 'suggested';
                  items.push(food);
                });

                this.items = items;
              })
          } else {
            this.items = [];
          }

          return $q.resolve();
        }

        return nixTrackApiClient('/search/instant', {
          params:           angular.merge({query: $select.search}, this.sources),
          ignoreLoadingBar: true
        })
          .then(response => response.data)
          .then(data => {
            if (this.$search !== search) {
              return;
            }

            let items = [], commonPhrases = [];

            if (data.self) {
              let category = `${user.get('first_name')}'s foods`;
              if (this.showCounters) {
                category += ` (${data.self.length})`;
              }

              data.self.forEach(food => {
                food.$category = category;
                food.$type     = 'history';
              });

              let self = data.self.slice(0, this.limits.self);
              category = `Your Foods`;
              if (this.showCounters) {
                category += ` (${self.length})`;
              }

              self.forEach(food => {
                food           = angular.copy(food);
                food.$category = category;
                items.push(food);
              });
            }

            if (data.common) {
              data.common = _.unique(data.common, f => f.tag_id);
              data.common.forEach(function (food, index) {
                if (food.food_name[food.food_name.length - 1] === 's') {
                  let unpluralized = food.food_name.replace(/e?s$/, '').toLowerCase();

                  if (_.find(data.common, food => food.food_name.toLowerCase() === unpluralized)) {
                    data.common.splice(index, 1);
                  }
                }
              });

              let category = 'COMMON FOODS';
              if (this.showCounters) {
                category += ` (${data.common.length})`;
              }

              data.common.forEach(food => {
                commonPhrases.push(food.food_name);

                food.$category = category;
                food.$type     = 'phrase';
              });

              let common = data.common.slice(0, this.limits.common);
              category   = 'COMMON FOODS';
              if (this.showCounters) {
                category += ` (${common.length})`;
              }

              common.forEach(food => {
                food           = angular.copy(food);
                food.$category = category;
                items.push(food);
              });
            }


            if (data.branded) {
              let category = 'BRANDED FOODS';
              if (this.showCounters) {
                category += ` (${data.branded.length})`;
              }

              data.branded.forEach(food => {
                food.$category = category;
                food.$type     = 'branded';
              });

              let branded = data.branded.slice(0, this.limits.branded);
              category    = 'BRANDED FOODS';
              if (this.showCounters) {
                category += ` (${branded.length})`;
              }

              branded.forEach(food => {
                food           = angular.copy(food);
                food.$category = category;
                items.push(food);
              });
            }


            if (this.enableFreeform) {
              let action = 'push';

              if (search.length >= 12 || search[0].match(/\d/) || search.indexOf('and') > -1 || search.indexOf('yesterday') > -1) {
                action = 'unshift';
              }

              let freeformItem = {
                food_name: $select.search,
                $category: 'FREEFORM',
                $type:     'freeform'
              };

              if (commonPhrases.indexOf($select.search) === -1) {
                items[action](freeformItem);
              }

              data.freeform = [freeformItem];
            }

            if (this.defaultToInput) {
              items.unshift({
                food_name: $select.search,
                $type:     'default'
              });
            }

            this.items = items;
            this.groupedItems = data;
          });
      };

      SmartSearch.prototype.logStat = function (food) {
        if (this.$search) {
          let log = {
            user_id:    user.get('id'),
            input:      this.$search,
            source:     food.nix_item_id ? 8 : 1,
            result_key: food.nix_item_id || food.food_name
          };

          nixTrackApiClient('/stats/log', {
            method: 'POST',
            data:   log
          });
        }
      };


      return SmartSearch;
    })
    .directive('instantSmartSearch', function ($timeout) {
      return {
        restrict: 'A',
        replace:  true,
        scope:    {
          smartSearch:       '=instantSmartSearch',
          maxFoodNameLength: '=?',
          searchButtonClick: '&?',
          autofocus:         '=?'
        },
        template: `
        <div class="smart-search">
          <div class="input-group">
            <ui-select ng-model="smartSearch.selected" on-select="smartSearch.select($item)" theme="track">
              <ui-select-match placeholder="{{placeholder || 'Search foods to add'}}">
                <span ng-bind="$select.selected.food_name"></span>
              </ui-select-match>
              <ui-select-choices
                ng-show="!(smartSearch.items.length === 1 && smartSearch.items[0].$type === 'default') && "
                refresh="smartSearch.loadFoods($select)"
                refresh-delay="100"
                repeat="item in (
                      $select.search && categoryFilter.current 
                        ? (categoryFilter.showAllInCategory 
                            ? smartSearch.groupedItems[categoryFilter.current] 
                            : (smartSearch.groupedItems[categoryFilter.current] | limitTo: smartSearch.limits.categoryView)) 
                        : smartSearch.items
                    )"
                group-by="'$category'"
                minimum-input-length="0"
                position="down"
              >
                <div class="list-group-item" ng-if="item.$type == 'history' || item.$type == 'branded' || item.$type == 'suggested'">
                  <span class="badge badge-calorie">
                    {{(item.nf_calories || 0) | number: 0}}
                    <span class="block text-center grey note">cal</span>
                  </span>
                  <div class="food-image-wrap">
                    <img class="food-image" ng-src="{{item.photo.thumb || placeholderImage}}" alt="{{item.food_name | ucwords}}">
                  </div>
                  <span class="te" ng-bind-html="item.food_name | ucwords | characters: maxFoodNameLength">
                  </span>

                  <span class="item-serving">
                  <span ng-if="item.brand_name">{{item.brand_name}},</span>
                    {{item.serving_qty || 1}} {{item.serving_unit || 'Serving'}}
                  </span>
                </div>

                <div class="common-food" ng-if="item.$type == 'phrase' || item.$type == 'freeform'">
                  <div class="food-image-wrap">
                    <img class="common-food-image" ng-src="{{item.photo.thumb || placeholderImage}}" alt="{{item.food_name | ucwords}}">
                  </div>
                  {{item.food_name | ucwords}}
                </div>


              </ui-select-choices>
              <ui-select-no-choice ng-show="smartSearch.items.length && ">
                <div class="smart-search-tabs" ng-show="$select.search && !smartSearch.disableTabs">
                  <ul>
                    <li class="clickable"
                        ng-class="{active: categoryFilter.current === category.type}" 
                        ng-repeat="category in categoryFilter.categories"
                        ng-click="categoryFilter.setCategory(category)"
                        ng-if="!category.isVisible || category.isVisible()">
                     {{category.label}}
                    </li>
                  </ul>
                </div>
                <div class="nothing">
                  Nothing to show here at the moment...
                </div>
              </ui-select-no-choice>
            </ui-select>
            <div class="input-group-addon">
              <i class="fa fa-search" ng-click="searchButtonClick()"></i>
            </div>
          </div>
        </div>
        `,
        link:     function (scope, element, attributes) {
          scope.placeholderImage = '//d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png';
          if (!scope.maxFoodNameLength) {scope.maxFoodNameLength = 50;}

          scope.placeholder = attributes.placeholder;
          scope.smartSearch.categoryFilter = scope.categoryFilter = {
            showAllInCategory: false,
            current:           '',
            categories:        [
              {label: 'All', type: ''},
              {label: 'Your Foods', type: 'self', isVisible: () => scope.smartSearch.sources.self},
              {label: 'Common', type: 'common', isVisible: () => scope.smartSearch.sources.common},
              {label: 'Branded', type: 'branded', isVisible: () => scope.smartSearch.sources.branded},
              {label: 'Freeform', type: 'freeform', isVisible: () => scope.smartSearch.enableFreeform}
            ],
            showAll:           function () {
              this.showAllInCategory = true;
            },
            setCategory:       function (category) {
              this.current = category.type;
              this.showAllInCategory = false;
            },
            reset:             function () {
              this.current = '';
            }
          };

          scope.$$childTail.$on('uis:close', () => {
            scope.categoryFilter.reset();
          });

          if (scope.autofocus) {
            $timeout(function () {
              let select = scope.$$childTail.$select;

              if (scope.smartSearch.enableSuggestedFoods) {
                select.activate();
                $timeout(() => select.focusSearchInput(), 300);
              } else {
                select.setFocus();
              }
            }, 100);
          }

          // below is an incredibly hacky way to disable TAB selection of the first item
          // which has been reported as confusing
          $timeout(function () {
            let select = scope.$$childTail.$select;

            let events = $._data($(select.searchInput)[0], 'events');

            let originalKeydownHandler;

            if (events && angular.isArray(events['keydown'])) {
              originalKeydownHandler = events['keydown'][0].handler;
              $(select.searchInput).off('keydown');
            }

            $(select.searchInput).on('keydown', function (e) {
              if (e.which === 9) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                return false;
              }
            });

            if (originalKeydownHandler) {
              $(select.searchInput).on('keydown', originalKeydownHandler);
            }
          }, 100);
        }
      }
    });
}());
