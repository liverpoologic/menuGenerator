module.exports = function(DATA) {
   return {
      addFood: require('./files/addFood.js')(DATA),
      addRecipe: require('./files/addRecipe.js')(DATA),
      addMenu: require('./files/addMenu.js')(DATA),
      // addRecipe: require('./files/addRecipe.js')(DATA)
   }
}