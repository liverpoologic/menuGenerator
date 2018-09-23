module.exports = function(DATA) {
   return {
      data_controller: require('./files/data_controller.js')(DATA),
      dropdowns: require('./files/dropdowns.js')(DATA),
      navigation: require('./files/navigation.js')(DATA),
   }
}