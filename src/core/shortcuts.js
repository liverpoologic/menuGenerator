var DATA = require("../data");
var u = require("../utilities")(DATA);
var tabs = require('../tabs')(DATA);
var FWK = require('../framework')(DATA);
//const ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

module.exports = function(event) {
   let key = event.keyCode;
   var vTabNums = [105, 102, 99, 110];
   switch (key) {
      // case 191: //forward slash key
      //    let j = u.ID("ingredientTable").rows.length - 2;
      //    if (u.ID("AddRecipe").style.display === "block" && u.ID(`selectIngredientFood${j}`).value !== "Food") {
      //       event.preventDefault();
      //       addRecipe.AddIngredientsRow();
      //    }
      //    break;
      case 13: //enter key
         if (u.ID("addFood").style.display === "block") {
            tabs.addFood.AddFoodBtn();
         } else if (u.ID("addRecipe").style.display === "block") {
            tabs.addRecipe.AddRecipeBtn();
         }
         break;
      default:
         // if (key > 111 && key < 120) { // f1-f8 keys for h tabs
         //    event.preventDefault();
         //    let x = key - 112;
         //    let tabId = params.tabList[x].id;
         //    u.OpenHTab(tabId);
         // } else if (vTabNums.indexOf(key) >= 0 && u.ID("admin").style.display === "block") { // . , 3 , 6 , 9 on numpad for v tabs
         //    event.preventDefault();
         //    let VtabList = document.getElementsByClassName("vtabcontent");
         //    let x = vTabNums.indexOf(key);
         //    u.OpenVTab(x + 1);
         // } else if (key > 48 && key < 57 && u.ID("shopping").style.display === "block") { // 1-7 for shopping tables
         //    event.preventDefault();
         //    let x = key - 49;
         //    tabs.shopping.ShowShoppingDiv(x);
         // }
         break;
   }
}