'use strict';

define(['require', 'intern/chai!assert'], function(require, assert) {
    function NutritionInfoPage(remote) {
        this.remote = remote;
    }

    NutritionInfoPage.prototype = {
        constructor: NutritionInfoPage,

        /**
         * Nutritional Information
         */
        'caloriesRange': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/usda/cheese-cheddar-1-oz/513fceb375b8dbbc2100001d')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories && calories<=maxCalories, 'Calories should be between ' + minCalories + ' and ' + maxCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Cheese, cheddar - 1 oz');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'restaurantItem': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/mcdonalds/cheeseburger/513fc9e73fe3ffd4030010a7')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Cheeseburger');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'USDAItemWithTag': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/usda/bacon-1-slice-cooked/513fceb575b8dbbc21001365')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Bacon - 1 slice cooked');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'USDAItemWithoutTag': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/usda/celery-raw-1-cup-chopped/513fceb575b8dbbc21001502')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Celery, raw - 1 cup chopped');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'GroceryItemWithTag': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/pure-protein/protein-bar/5576bc44a1a3546857b9d695')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)


                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Protein Bar');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'GroceryItemWithoutTag': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/ahold/celery/553fc81e7d5dadee77b0e90a')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Celery');
                    })
                    .end()

                // Vertify nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'RecipeBasedUSDAItem': function(config, minCalories, maxCalories) { // Move to a Page object
            return this.remote
                .get(config.baseUrl+'/i/nutritionix/guacamole-1-oz/5659d257f81be79301f45392')
                .then(function() {
                    if (config.mobileDevice != 'true') {
                        this.setWindowSize(config.width, config.height);
                    }
                })
                .setFindTimeout(config.maxFindTimeout)

                .findByCssSelector('div.line:nth-child(6) > div:nth-child(2)')
                    .getVisibleText()
                    .then(function(text) {
                        var patt = /Calories [0-9]+/g;

                        // Test if 'Calories' label and value exists
                        assert.strictEqual(patt.test(text), true, 'Search results contains calories value.');

                        // Test calories value
                        var calories = text.indexOf('Calories') > -1? text.split(' ')[1]:NaN;
                        assert(calories>=minCalories, 'Calories should be minimum ' + minCalories);
                    })
                    .end()

                // Verify Food Name
                .findByCssSelector('h1.food-item-name')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Guacamole - 1 oz');
                    })
                    .end()

                // Vertify Nutrition Label
                .findByCssSelector('div.nutritionLabel > div.title')
                    .getVisibleText()
                    .then(function(text) {
                        assert.strictEqual(text, 'Nutrition Facts');
                    })
                    .end()

                // If not errors then return true;
                .then(function() {
                    return true;
                });
        },
        'GroceryItem404': function(config) {
            return this.remote
              .get(config.baseUrl+'/i/mcalisters-deli/broccoli-cheddar-soup/529e7deef9655f6d35002b41')
              .then(function() {
                  if (config.mobileDevice != 'true') {
                      this.setWindowSize(config.width, config.height);
                  }
              })
              .setFindTimeout(config.maxFindTimeout)

              // Vertify 404 meta tag
              .findByCssSelector('meta[content="404"]')
                  .end()

              // Verify 404 Page Have Title
              .findByCssSelector('h1')
                  .getVisibleText()
                  .then(function(text) {
                      assert.strictEqual(text, 'Page Not Found :(');
                  })

              // If not errors then return true;
              .then(function() {
                  return true;
              });

        }
    };

    return NutritionInfoPage;
});
