var tagsInput = require('tags-input');

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var u = require("../../utilities")(DATA);

   function generator() {
      var els = {};
      var tabContent = u.ID('addFood_tab_content');

      els.heading = u.CreateEl('h2').innerText('Add Food').parent(tabContent).end();
      var p = u.CreateEl('div').parent(tabContent).style('width:430px').className('tabcontent').end();

      els.thing = u.CreateEl('input').type('text').placeholder('name of food').parent(p).end();
      u.Br(p);
      els.unit = u.CreateEl('input').type('text').placeholder('unit').parent(p).end();
      u.Br(p);
      els.shop = u.CreateEl('select').id('selectFoodShop').parent(p).end();
      u.Br(p);
      els.foodType = u.CreateEl('select').id('selectFoodType').parent(p).end();
      u.Br(p);
      els.allergenDiv = u.CreateEl('div').parent(p).style('width:inherit').end();
      u.Br(p);
      els.addfood_btn = u.CreateEl('button').innerText('Add Food').parent(p).end();


      els.addfood_btn.addEventListener("click", function() {
         AddFoodBtn(els)
      });

      els.allergens = u.CreateElement("input", els.allergenDiv, "allergenInput"); //this is actually hidden by the tags-input library - but stores the resultant value
      tagsInput(els.allergens, "allergenList", "create", " ");
      els.allergens.setAttribute('type', 'tags');

   }

   /** adds a food to d.foods based on the info in the add food tab */
   function AddFoodBtn(els) {
      var toCreate = {};
      Object.keys(els).forEach(prop => {
         toCreate[prop] = els[prop].value;
      });
      //split allergens into an array
      toCreate.allergens = toCreate.allergens.split(" ");

      d.foods.addFood(toCreate);

      u.ClearVals(els);

      tagsInput(u.ID('allergenInput'), "", "clear", " ");

      d.write();
      c.write(); //incase allergens have changed
   }

   return {
      generator: generator,
      AddFoodBtn: AddFoodBtn
   }
}