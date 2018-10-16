var tagsInput = require('tags-input');

module.exports = function(DATA) {

   var addFood = require('./addFood.js')(DATA);
   var addRecipe = require('./addRecipe.js')(DATA);
   var addMenu = require('./addMenu.js')(DATA);


   function generator() {
      addFood.generator();
      addRecipe.generator();
      //  addMenu.generator();
   }

   return {
      generator: generator,
      AddFoodBtn: addFood.AddFoodBtn
   }
}