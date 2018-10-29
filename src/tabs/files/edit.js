module.exports = function(DATA) {

   var viewMenu = require('./viewMenu.js')(DATA);
   // var editMenu = require('./editMenu.js')(DATA);
   // var people = require('./people.js')(DATA);
   // var shopping = require('./shopping.js')(DATA);

   function generator() {
      viewMenu.generator();
      // editMenu.generator();
      // people.generator();
      // shopping.generator();
   }

   return {
      generator: generator,
   }
}