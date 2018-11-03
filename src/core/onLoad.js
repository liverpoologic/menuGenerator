var DATA = require("../data");
var u = require("../utilities")(DATA);
var tabs = require('../tabs')(DATA);
var FWK = require('../framework')(DATA);
var shortcuts = require('./shortcuts.js');
const ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

module.exports = function() {
   window.data = DATA;
   var d = DATA.dict;
   var c = DATA.config;

   window.export_recipes = function() {

      function getUcString(str) {
         return str.charAt(0).toUpperCase() + str.slice(1);
      }

      var grpdRecipes = u.GroupBy(d.recipes, 'mealType');
      Object.keys(grpdRecipes).forEach(mealType => {
         let grp = grpdRecipes[mealType];
         grpdRecipes[mealType] = u.GroupBy(grp, 'recipeType');
      });
      var ToC = u.ObjToArr(grpdRecipes)
         .sort(x => c.enums.mealTypeEnum.indexOf(x.key))
         .map(mealTypeGrp => {
            var recipeTypeContents = u.ObjToArr(mealTypeGrp.val)
               .map(recipeTypeGrp => {
                  var recipeList = u.ObjToArr(recipeTypeGrp.val).sort((a, b) => u.Compare(a.key, b.key)).map(recipe => {
                     return `<list3>${recipe.key}</list3>`;
                  }).join("");
                  return `<list2>${getUcString(recipeTypeGrp.key)}</list2>${recipeList}`;
               }).join("");
            return `<list1>${getUcString(mealTypeGrp.key)}</list1>${recipeTypeContents}`;
         }).join("");

      var htmlContent = u.ObjToArr(grpdRecipes)
         .sort(x => c.enums.mealTypeEnum.indexOf(x.key))
         .map(mealTypeGrp => {

            var recipeTypeContents = u.ObjToArr(mealTypeGrp.val)
               .map(recipeTypeGrp => {
                  var recipeList = u.ObjToArr(recipeTypeGrp.val).sort((a, b) => u.Compare(a.key, b.key)).map(recipe => {
                     let ingTable = recipe.val.ingredients.map(ingredient => {
                        return `<tr><td>${ingredient.foodName}</td><td>${ingredient.quantity}</td><td>${d.foods[ingredient.foodName].unit}</td></tr>`;
                     }).join("");
                     return `<div class='recipe'><h3>${recipe.key}</h3><p><i>Serves ${recipe.val.serves}</p></i><table><tbody>${ingTable}</table></tbody><p>${recipe.val.method}</p></div>`;
                  }).join("");
                  return `<h2>${getUcString(recipeTypeGrp.key)}</h2><div>${recipeList}</div>`;
               }).join("");
            return `<h1>${getUcString(mealTypeGrp.key)}</h1><div>${recipeTypeContents}</div>`;
         }).join("");
      let fs = require('fs');
      var css = fs.readFileSync('./src/markdown/markdown.css', 'utf8');
      var html = `<style>${css}</style><h1>Table Of Contents</h1>${ToC}${htmlContent}`;
      fs.writeFileSync('./resources/recipe_book.html', html);
      console.log(html);
   };

   //initialise fontawesome
   require("../../node_modules/@fortawesome/fontawesome-free/js/all.js");

   var isTest = remote.getGlobal('sharedObject').testMode;

   FWK.navigation.Initialise(DATA.params.tabList, isTest);
   FWK.dropdowns.Initialise();

   // for each tab, call the generator() function

   DATA.params.tabList.forEach(tab => {
      tabs[tab.id].generator();
   });


   // Import the dictionary and config
   c.read();
   d.read();

   console.log(d);
   console.log(c);

   d.write();
   c.write();

   // when user clicks elsewhere, modals close
   window.onclick = function(click) {
      let t = click.target;
      if (t.className === 'modal') {
         t.style = "display:none";
      }
   };
   // // create listeners for each tab button

   // // when you change the filepath, write to e
   // u.ID("filepath").addEventListener("change", function () {
   //     Config.filepath = u.ID("filepath").value;
   //     u.WriteConfig();
   // });
   //
   // //create event listener for 'save_backup' and 'restore_from_backup' button
   // u.ID("save_backup").addEventListener("click",u.SaveBackup);
   // u.ID("restore_from_backup").addEventListener("click",u.RestoreFromBackup);
   //
   // // function to return to normal once pdf has printed
   // ipc.on('wrote-pdf', function (event, path) {
   //     u.HideElements("PrintMenu");
   //     u.HideElements("PrintShopping");
   //     u.ShowElements("mainApp", "block");
   //     console.log(`Wrote PDF to: ${path}`);
   // });
   //
   // // listener to support keyboard shortcuts
   // document.addEventListener("keydown", shortcuts);


};

// u.ID('missingItemWizard').addEventListener("click",d.MissingItemWizard);