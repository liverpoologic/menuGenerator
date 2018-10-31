var DATA = require("../data");
var params = require('./params.js');
var u = require("../utilities")(DATA);
var tabs = require('../tabs')(DATA);
var FWK = require('../framework')(DATA);
var shortcuts = require('./shortcuts.js');
const ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

module.exports = function() {
   var d = DATA.dict;
   var c = DATA.config;

   //makes d and c accessible from the console
   window.debug = {
      d: d,
      c: c
   };

   window.debug.export_recipes = function() {

      var grpdRecipes = u.GroupBy(d.recipes, 'mealType');
      Object.keys(grpdRecipes).forEach(mealType => {
         let grp = grpdRecipes[mealType];
         grpdRecipes[mealType] = u.GroupBy(grp, 'recipeType');
      });
      var markdown = u.ObjToArr(grpdRecipes)
         .sort(x => c.enums.mealTypeEnum.indexOf(x.key))
         .map(mealTypeGrp => {

            var recipeTypeContents = u.ObjToArr(mealTypeGrp.val)
               //   .sort(x => c.enums.recipeTypeEnum.indexOf(x.key))
               .map(recipeTypeGrp => {
                  var recipeList = u.ObjToArr(recipeTypeGrp.val).sort((a, b) => u.Compare(a.key, b.key)).map(recipe => {
                     let ingTable = recipe.val.ingredients.map(ingredient => {
                        return [ingredient.foodName, ingredient.quantity, d.foods[ingredient.foodName].unit].join("|");
                     }).join("\n");
                     return `### ${recipe.key}\n*Serves ${recipe.val.serves}*\n - | - | - \n----|----|----\n${ingTable}\n${recipe.val.method}`
                  }).join("\n\n");
                  return `## ${recipeTypeGrp.key}\n${recipeList}`;
               }).join("\n");

            return `# ${mealTypeGrp.key}\n${recipeTypeContents}`;

         }).join("\n");
      let fs = require('fs');
      fs.writeFileSync('./resources/recipe_book.md', markdown);
      console.log(markdown)
   }

   //initialise fontawesome
   require("../../node_modules/@fortawesome/fontawesome-free/js/all.js");

   var isTest = remote.getGlobal('sharedObject').testMode;

   FWK.navigation.Initialise(params.tabList, isTest);
   FWK.dropdowns.Initialise();

   //for each tab, call the generator() function
   console.log(tabs);
   params.tabList.forEach(tab => {
      console.log(tab.id);
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


   var VtabList = document.getElementsByClassName("vtablinks");
   for (let i = 0; i < VtabList.length; i++) {
      let btnID = VtabList[i].id;
      let tabID = btnID.slice(-1);
      u.ID(btnID).addEventListener("click", function() {
         u.OpenVTab(tabID);
      });
   }

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
   document.addEventListener("keydown", shortcuts);


};

// u.ID('missingItemWizard').addEventListener("click",d.MissingItemWizard);