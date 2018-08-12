const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");
const fs = require("fs");

chai.should();
chai.use(chaiAsPromised);

describe('Test Suite', function () {
  this.timeout(10000);
  let app;

  before(function () {

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
      args: [path.join(__dirname, '..')],
      chromeDriverLogPath: '../chromedriverlog.txt'
    });
    chaiAsPromised.transferPromiseness = app.transferPromiseness;
    return app.start()
  });

  after(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  });

  beforeEach(function (done) {
    setTimeout(function(){
      done();
    }, 2000);
  });

  it('shows an initial window', function () {
    return app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  // describe('Adding and Removing Foods', function () {

  //   it('add food - empty allergens', function () {
  //     app.client.click("#AddFoodTabBtn");

  //     return app.client.setValue('#foodThing', 'aaaaatestfood')
  //       .setValue('#foodUnit', 'g')
  //       .selectByValue('#selectFoodShop', 'Tesco')
  //       .selectByValue('#selectFoodType', 'starch')
  //       .click('#addfood_btn').then(function () {

  //         var Dict = JSON.parse(fs.readFileSync('./resources/Dict.json', 'utf8'));
  //         var ret = Dict[1].aaaaatestfood;
  //         return ret;
  //       }).should.eventually.deep.equal({ "unit": "g", "shop": "Tesco", "foodType": "starch", "allergens": [] });

  //   });

  //   DeleteTopItem(1, 'aaaaatestfood')

  //   it('add food - with allergens', function () {
  //     app.client.click("#AddFoodTabBtn");

  //     return app.client.setValue('#foodThing', 'aaaaatestfoodwithallergen')
  //       .setValue('#foodUnit', 'g')
  //       .selectByValue('#selectFoodShop', 'Tesco')
  //       .selectByValue('#selectFoodType', 'starch')
  //       .addValue('.tags-input input', 'dairy')
  //       .addValue('.tags-input input', '\uE004')
  //       .addValue('.tags-input input', 'gluten')
  //       .addValue('.tags-input input', '\uE004')
  //       .click('#addfood_btn').then(function () {

  //         var Dict = JSON.parse(fs.readFileSync('./resources/Dict.json', 'utf8'));
  //         var ret = Dict[1].aaaaatestfoodwithallergen;
  //         return ret;
  //       }).should.eventually.deep.equal({ "unit": "g", "shop": "Tesco", "foodType": "starch", "allergens": ["dairy", "gluten"] });

  //   });

  //   DeleteTopItem(1, 'aaaaatestfoodwithallergen')

  // });

  describe('Adding and Removing Recipes', function () {

    it('add recipe - multiple ingredients', function () {
      app.client.click("#AddRecipeTabBtn");

      return app.client.setValue('#recipeTitle', 'AAAAtestrecipe')
        .selectByValue('#selectRecipeMealType', 'lunch')
        .selectByValue('#selectRecipeType', 'veg')
        .setValue('#recipeServes', 6)
        .setValue('#recipeMethod', 'this is a method hurrah')
        .selectByValue('#recipeMorv', 'b')
        .selectByValue('#selectIngredientFood0', 'butter')
        .setValue('#ingredientQuantitySmall0', 100)
        .selectByValue('#selectIngredientMorv0', 'b')
        .click('#addIngRowHeader')
        .selectByValue('#selectIngredientFood1', 'flour')
        .setValue('#ingredientQuantitySmall1', 200)
        .click('#addRecipe_btn').then(function () {
          var Dict = JSON.parse(fs.readFileSync('./resources/Dict.json', 'utf8'));
          return Dict[2].AAAAtestrecipe;
        }).should.eventually.deep.equal({
          ingredients: {
            butter: {
              food: {
                shop: "Bookers",
                unit: "g"
              },
              morv: "b",
              quantitySmall: 100
            },
            flour: {
              food: {
                shop: "Bookers",
                unit: "g"
              },
              morv: null,
              quantitySmall: 200
            }

          },
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

    // it('add recipe - many ingredients', function () {
    //   app.client.click("#AddFoodTabBtn");

    //   return app.client.setValue('#foodThing', 'aaaaatestfoodwithallergen')
    //     .setValue('#foodUnit', 'g')
    //     .selectByValue('#selectFoodShop', 'Tesco')
    //     .selectByValue('#selectFoodType', 'starch')
    //     .addValue('.tags-input input', 'dairy')
    //     .addValue('.tags-input input', '\uE004')
    //     .addValue('.tags-input input', 'gluten')
    //     .addValue('.tags-input input', '\uE004')
    //     .click('#addfood_btn').then(function () {

    //       var Dict = JSON.parse(fs.readFileSync('./resources/Dict.json', 'utf8'));
    //       var ret = Dict[1].aaaaatestfoodwithallergen;
    //       return ret;
    //     }).should.eventually.deep.equal({ "unit": "g", "shop": "Tesco", "foodType": "starch", "allergens": ["dairy", "gluten"] });

    // });

    // DeleteTopItem(1, 'aaaaatestfoodwithallergen')

  });


  //-------------useful functions-------------
  function DeleteTopItem(tableID, key) {

    return it('delete ' + key, function () {
      app.client.click('#AdminTabBtn');
      app.client.click(`#AdminTabBtn${tableID}`);

      return app.client.click(`#t${tableID}RemoveLinebtn1`).then(function () {
        var Dict = JSON.parse(fs.readFileSync('./resources/Dict.json', 'utf8'));
        var ret = Dict[tableID][key];
        return chai.assert.isUndefined(ret);
        
      })
    });
  }

});