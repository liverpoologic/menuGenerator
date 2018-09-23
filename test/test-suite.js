const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");
const fs = require("fs");

chai.should();
chai.use(chaiAsPromised);

describe('Test Suite', function() {
   this.timeout(10000);
   let app;

   before(function() {

      app = new Application({
         // Your electron path can be any binary
         // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
         // But for the sake of the example we fetch it from our node_modules.
         path: electronPath,

         // Assuming you have the following directory structure

         //  |__ my project
         //     |__ ...
         //     |__ main.js
         //     |__ package.json
         //     |__ index.html
         //     |__ ...
         //     |__ test
         //        |__ spec.js  <- You are here! ~ Well you should be.

         // The following line tells spectron to look and use the main.js file
         // and the package.json located 1 level above.
         args: [path.join(__dirname, '..'), '-test'],
         chromeDriverLogPath: '../chromedriverlog.txt'
      });
      chaiAsPromised.transferPromiseness = app.transferPromiseness;
      return app.start();
   });

   after(function() {
      if (app && app.isRunning()) {
         //  return app.stop();
      }
   });

   beforeEach(function(done) {
      setTimeout(function() {
         done();
      }, 200);
   });

   it('shows an initial window', function() {
      return app.client.getWindowCount().then(function(count) {
         assert.equal(count, 1);
         // Please note that getWindowCount() will return 2 if `dev tools` are opened.
         // assert.equal(count, 2)
      });
   });

   describe('Adding and Removing Foods', function() {

      it('add food - empty allergens', function() {
         app.client.click("#addFood_tab_btn");

         return app.client.setValue('#foodThing', 'aatestfood')
            .setValue('#foodUnit', 'g')
            .selectByValue('#selectFoodShop', 'Tesco')
            .selectByValue('#selectFoodType', 'starch')
            .click('#addfood_btn').then(function() {

               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               var ret = Dict.foods.aatestfood;
               return ret;
            }).should.eventually.deep.equal({
               "unit": "g",
               "shop": "Tesco",
               "foodType": "starch",
               "allergens": []
            });

      });

      it('edit food - change unit', function() {

         return app.client.click("#admin_tab_btn")
            .click("#AdminTabBtn1")
            .click('#t1TableUnit1')
            .setValue('#input_t1TableUnit1', 'tsp')
            .click('#save_t1TableUnit1').then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.foods.aatestfood;
            }).should.eventually.deep.equal({
               "unit": "tsp",
               "shop": "Tesco",
               "foodType": "starch",
               "allergens": []
            });

      });

      DeleteTopItem(1, 'aatestfood');

      it('add food - with allergens', function() {
         app.client.click("#addFood_tab_btn");

         return app.client.setValue('#foodThing', 'aatestfoodwithallergen')
            .setValue('#foodUnit', 'g')
            .selectByValue('#selectFoodShop', 'Tesco')
            .selectByValue('#selectFoodType', 'starch')
            .addValue('.tags-input input', 'dairy')
            .addValue('.tags-input input', '\uE004')
            .addValue('.tags-input input', 'gluten')
            .addValue('.tags-input input', '\uE004')
            .click('#addfood_btn').then(function() {

               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               var ret = Dict.foods.aatestfoodwithallergen;
               return ret;
            }).should.eventually.deep.equal({
               "unit": "g",
               "shop": "Tesco",
               "foodType": "starch",
               "allergens": ["dairy", "gluten"]
            });

      });

      DeleteTopItem(1, 'aatestfoodwithallergen');

   });

   describe('Adding and Removing Recipes', function() {

      it('add recipe - multiple ingredients', function() {
         app.client.click("#addRecipe_tab_btn");

         return app.client.setValue('#recipeTitle', 'AAAAtestrecipe')
            .selectByValue('#selectRecipeMealType', 'lunch')
            .selectByValue('#selectRecipeType', 'veg')
            .setValue('#recipeServes', 6)
            .setValue('#recipeMethod', 'this is a method hurrah')
            .selectByValue('#recipeMorv', 'b')
            .selectByValue('#selectIngredientFood0', 'butter')
            .setValue('#ingredientQuantitySmall0', 100)
            .selectByValue('#selectIngredientMorv0', 'v')
            .click('#addIngRowHeader')
            .selectByValue('#selectIngredientFood1', 'flour')
            .setValue('#ingredientQuantitySmall1', 200)
            .click('#addRecipe_btn').then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.recipes.AAAAtestrecipe;
            }).should.eventually.deep.equal({
               ingredients: [{
                     foodName: 'butter',
                     morv: "v",
                     quantity: 100
                  },
                  {
                     foodName: 'flour',
                     morv: "b",
                     quantity: 200
                  }
               ],
               mealType: "lunch",
               method: "this is a method hurrah",
               morv: [
                  "b"
               ],
               recipeType: "veg",
               serves: 6
            });
      });

      it('edit recipe - add an extra ingredient', function() {
         return app.client.click("#admin_tab_btn")
            .click("#AdminTabBtn2")
            .click('#t2TableKey1')
            .click('#addIngRowHeader')
            .selectByValue('#selectIngredientFood2', 'sugar')
            .setValue('#ingredientQuantitySmall2', 10)
            .setValue('#ingredientQuantitySmall1', 220)
            .click('#editRecipe_btn').then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.recipes.AAAAtestrecipe;
            }).should.eventually.deep.equal({
               ingredients: [{
                     foodName: 'butter',
                     morv: "v",
                     quantity: 100
                  },
                  {
                     foodName: 'flour',
                     morv: "b",
                     quantity: 220
                  },
                  {
                     foodName: 'sugar',
                     morv: "b",
                     quantity: 10
                  }
               ],
               mealType: "lunch",
               method: "this is a method hurrah",
               morv: [
                  "b"
               ],
               recipeType: "veg",
               serves: 6
            });
      });


      DeleteTopItem(2, 'AAAAtestrecipe');

   });

   describe('Adding a Menu', function() {

      it('add a new menu', function() {

         return app.client.click('#addMenu_tab_btn')
            .setValue('#newMenuTitle', 'AAANewMenu')
            .addValue('#menuStartDate', '03082018')
            .addValue('#menuEndDate', '05082018')
            .click('#add_weekend_menu').then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.menus.AAANewMenu;
            }).should.eventually.deep.equal({
               startDate: "2018-08-03T00:00:00.000Z",
               endDate: "2018-08-05T00:00:00.000Z",
               meateaters: null,
               vegetarians: null,
               meals: [{
                     mealType: "dinner",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "snack",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-05T00:00:00.000Z",
                     "recipes": [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-05T00:00:00.000Z",
                     recipes: []
                  }
               ]
            });
      });

      it('add a new meal', function() {

         return app.client.click('#editMenu_tab_btn')
            .selectByValue('#selectEditMenu', 'AAANewMenu')
            .click('#editMealsEditMenu_btn')
            .selectByValue('#selectDayForAddMeals', 'Fri Aug 03 2018 01:00:00 GMT+0100 (GMT Daylight Time)')
            .selectByValue('#selectMealTypeForAddMeals', 'lunch')
            .click('#addMeals_btn')
            .click('#close_addMeals_modal_btn')
            .then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.menus.AAANewMenu;
            }).should.eventually.deep.equal({
               startDate: "2018-08-03T00:00:00.000Z",
               endDate: "2018-08-05T00:00:00.000Z",
               meateaters: null,
               vegetarians: null,
               meals: [{
                     mealType: "lunch",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "snack",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-05T00:00:00.000Z",
                     "recipes": [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-05T00:00:00.000Z",
                     recipes: []
                  }
               ]
            });

      });

      it('add 3 recipes to the menu', function() {

         return app.client.click('#addRecipeToMenu_btn')
            .selectByValue('#selectMealForMenu', 0)
            .selectByValue('#selectRecipeForMenu', 'Roux')
            .selectByValue('#selectMorvForMenu', 'b')
            .click('#addRecipeToMenu_submit')
            .selectByValue('#selectMealForMenu', 0)
            .selectByValue('#selectRecipeForMenu', 'Test Dessert')
            .selectByValue('#selectMorvForMenu', 'b')
            .click('#addRecipeToMenu_submit')
            .selectByValue('#selectMealForMenu', 0)
            .selectByValue('#selectRecipeForMenu', 'Test Veg')
            .selectByValue('#selectMorvForMenu', 'v')
            .click('#addRecipeToMenu_submit')
            .click('#addRecipeCancel_btn')
            .then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.menus.AAANewMenu;
            }).should.eventually.deep.equal({
               startDate: "2018-08-03T00:00:00.000Z",
               endDate: "2018-08-05T00:00:00.000Z",
               meateaters: null,
               vegetarians: null,
               meals: [{
                     mealType: "lunch",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: [{
                           recipeTitle: "Roux",
                           morv: "b"
                        },
                        {
                           recipeTitle: "Test Veg",
                           morv: "v"
                        },
                        {
                           recipeTitle: "Test Dessert",
                           morv: "b"
                        }
                     ]
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "snack",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-05T00:00:00.000Z",
                     "recipes": [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-05T00:00:00.000Z",
                     recipes: []
                  }
               ]
            });

      });

      it('multiply up and add modifier', function() {

         return app.client.setValue('#meateaters0', 20)
            .setValue('#vegetarians0', -1)
            .click('#multiplyUp_btn')
            .setValue('#multiplyUpMeateaters', 10)
            .setValue('#multiplyUpVegetarians', 5)
            .click('#multiplyUp_submit')
            .then(function() {
               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               return Dict.menus.AAANewMenu;
            }).should.eventually.deep.equal({
               startDate: "2018-08-03T00:00:00.000Z",
               endDate: "2018-08-05T00:00:00.000Z",
               meateaters: 10,
               vegetarians: 5,
               meals: [{
                     mealType: "lunch",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: [{
                           recipeTitle: "Roux",
                           morv: "b"
                        },
                        {
                           recipeTitle: "Test Veg",
                           morv: "v"
                        },
                        {
                           recipeTitle: "Test Dessert",
                           morv: "b"
                        }
                     ],
                     modifier: {
                        meateaters: 20,
                        vegetarians: -1
                     }
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-03T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "snack",
                     date: "2018-08-04T00:00:00.000Z",
                     recipes: []
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "dinner",
                     date: "2018-08-04T00:00:00.000Z",
                     "recipes": []
                  },
                  {
                     mealType: "breakfast",
                     date: "2018-08-05T00:00:00.000Z",
                     "recipes": [{
                        recipeTitle: "Standard Breakfast",
                        morv: "b"
                     }]
                  },
                  {
                     mealType: "lunch",
                     date: "2018-08-05T00:00:00.000Z",
                     recipes: []
                  }
               ]
            });

      })


   });

   describe('Edit and View Menu', function() {

      it('correct meal title for sunday breakfast', function() {
         return app.client.click('#viewMenu_tab_btn')
            .selectByValue('#selectViewMenu', 'AAANewMenu')
            .getText('#mealTitle6').should.eventually.deep.equal('Sunday breakfast')
      });

      it('correct ingredient amount for butter', function() {
         return app.client.click('#showMealBtn0')
            .click('#showRecipeBtn00')
         getText("[id='0002']").should.eventually.deep.equal('2.04')
      });

      it('correct ingredient amount for cucumber', function() {
         return app.client.click('#showRecipeBtn01')
         getText("[id='0102']").should.eventually.deep.equal('1.6')
      });

   });

   describe('Shopping List', function() {

      it('check flour amount', function() {
         return app.client.click('#shopping_tab_btn')
            .selectByValue('#selectMenuForShopping', 'AAANewMenu')
            .click('#shoppingbtnBookers')
            .getText('#Bookersrow1col1').should.eventually.deep.equal('4.43')
      });

      it('check flour unit', function() {
         return app.client.getText('#Bookersrow1col2').should.eventually.deep.equal('kg');
      });

      it('check number of shopping buttons illuminated', function() {
         return app.client.getAttribute('#shoppingbtnWren_Davis', 'className').should.eventually.equal('shoppingbtn-empty')
      });

   });
   //
   // describe('Navigation', function() {
   //
   //    it('Get to admin t3 screen', function() {
   //       return app.client.keys('F8')
   //          .keys("\uE01D") //this is numpad 3
   //          .getText('#t3TableKey1').should.eventually.deep.equal('AAANewMenu');
   //    });
   //
   //    it('Get to Peterley Shopping tab', function() {
   //       return app.client.keys('F6')
   //          .keys('4')
   //          .getText('#Peterleyrow1col0').should.eventually.deep.equal('lettuce');
   //    });
   //
   // });

   describe('People', function() {

      it('delete and add specials row', function() {
         return app.client.click('#people_tab_btn')
            .selectByValue('#selectPeopleMenu', 'AAANewMenu')
            .click('#agn-1')
            .click('#addSpecialRowHeader')
            .getValue('#agnMorv1').should.eventually.deep.equal('morv')
      });
      // Can't get this to work, don't know why
      // it('add a person',function(){
      //   app.client.setValue('#agnPerson1','New Person')
      //   .addValue("[list='allergenList']", 'gluten');
      //
      //   HackedPause();
      // //  .click('#PeopleTabBtn')
      //   // .addValue("[list='allergenList']", '\uE004')
      //   // .keys('Tab')
      //   // .addValue("[list='allergenList']", 'gluten')
      //   // .keys('Tab')
      //   // .addValue("[list='allergenList']", '\uE004')
      //   // .addValue("[list='allergenList']", 'gluten')
      //   // .addValue("[list='allergenList']", '\uE004')
      //   // .addValue("[list='food']", 'butter')
      //   // .addValue("[list='food']", '\uE004')
      //   // .addValue("[list='food']", 'sugar')
      //   // .addValue("[list='food']", '\uE004')
      //     return app.client.selectByValue('agnMorv1','m')
      //   .click('saveAllergens')
      //   .keys('F4')
      //   .selectByValue('#selectViewMenu','AAANewMenu')
      //   .click('#showMealBtn0')
      //   .click('#showRecipeBtn00')
      //   .getText('#specials00').should.eventually.deep.equal('Specials:\n1 - butter (New Person)')
      // })

   });

   describe('Delete Menu', function() {
      DeleteTopItem(3, 'AAANewMenu');
   });


   //-------------useful functions-------------
   function DeleteTopItem(tableID, key) {

      return it('delete ' + key, function() {
         var mapping = [null, 'foods', 'recipes', 'menus'];

         return app.client.click('#admin_tab_btn')
            .click(`#AdminTabBtn${tableID}`)
            .click(`#t${tableID}RemoveLinebtn1`).then(function() {
               HackedPause()

               var Dict = JSON.parse(fs.readFileSync('./resources/test-dict.json', 'utf8'));
               var ret = Dict[mapping[tableID]][key];
               return chai.assert.isUndefined(ret);
            });
      });
   }

   function HackedPause() {
      let j;
      for (let i = 0; i < 5000000; i++) {
         j = i;
      }
      return true;
   }

});