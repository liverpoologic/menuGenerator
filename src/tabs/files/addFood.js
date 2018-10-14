var tagsInput = require('tags-input');

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var u = require("../../utilities")(DATA);

   function generator() {
      u.ID("addfood_btn").addEventListener("click", AddFoodBtn);

      var allergenInput = u.CreateElement("input", u.ID("allergenDiv"), "allergenInput"); //this is actually hidden by the tags-input library - but stores the resultant value
      tagsInput(allergenInput, "allergenList", "create", " ");
      allergenInput.setAttribute('type', 'tags');

   }

   /** adds a food to d.foods based on the info in the add food tab */
   function AddFoodBtn() {

      let thing = u.ID("foodThing").value.toLowerCase();
      let shop = u.ID("selectFoodShop").value;
      let foodType = u.ID("selectFoodType").value;
      let foodUnitVal = u.ID("foodUnit").value;
      let foodUnit = foodUnitVal === "" ? null : foodUnitVal;
      let allergens = u.ID("allergenInput").value.split(" ");

      d.foods.addFood(thing, foodUnit, shop, foodType, allergens);
      u.SetValues([
         ["foodThing", ""],
         ["foodUnit", ""],
         ["selectFoodShop", "Shop"],
         ["selectFoodType", "Food Type"]
      ]);

      tagsInput(u.ID('allergenInput'), "", "clear", " ");

      d.write();
      c.write(); //incase allergens have changed
   }

   return {
      generator: generator,
      AddFoodBtn: AddFoodBtn
   }
}