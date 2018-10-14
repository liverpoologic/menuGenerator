module.exports = function(DATA) {
   return {
      addFood: require('./files/addFood.js')(DATA),
      addRecipe: require('./files/addRecipe.js')(DATA),
      addMenu: require('./files/addMenu.js')(DATA),
      viewMenu: require('./files/viewMenu.js')(DATA),
      editMenu: require('./files/editMenu.js')(DATA),
      admin: require('./files/admin.js')(DATA),
      people: require('./files/people.js')(DATA),
      shopping: require('./files/shopping.js')(DATA)
   }
}