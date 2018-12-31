var tagsInput = require('tags-input');

module.exports = function(DATA) {

   var addFood = require('./addFood.js')(DATA);
   var addRecipe = require('./addRecipe.js')(DATA);
   var addMenu = require('./addMenu.js')(DATA);

   function generator() {
      var els = {};
      els.addFood = addFood.generator();
      els.addRecipe = addRecipe.generator();
      els.addMenu = addMenu.generator();
      return els;
   }

   return {
      generator: generator,
      AddFoodBtn: addFood.AddFoodBtn
   }
}