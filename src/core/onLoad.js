var DATA = require("../data");
var params = require('./params.js');
//var Config = d.Config;
//var e = Config.enums
var u = require("../utilities")(DATA);
var tabs = require('../tabs')(DATA);
var FWK = require('../framework')(DATA);
//const ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;

module.exports = function() {
   var d = DATA.dict;
   var c = DATA.config;

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
   // document.addEventListener("keydown", KeyPress);
};

/** executes an action depending on the key pressed */
// function KeyPress() {
//     let key = event.keyCode;
//     var vTabNums = [105,102,99,110];
//     switch (key) {
//         case 191: //forward slash key
//             let j = u.ID("ingredientTable").rows.length - 2;
//             if (u.ID("AddRecipe").style.display === "block" && u.ID(`selectIngredientFood${j}`).value !== "Food") {
//                 event.preventDefault();
//                 addRecipe.AddIngredientsRow();
//             }
//             break;
//         case 13: //enter key
//             if (u.ID("AddFood").style.display === "block") {
//                 event.preventDefault();
//                 addFood.btn();
//             }
//             if (u.ID("AddMenu").style.display === "block") {
//                 event.preventDefault();
//                 addFood.btn();
//             }
//             break;
//         default:
//             if (key > 111 && key < 120) {// f1-f8 keys for h tabs
//                 let HtabList = document.getElementsByClassName("htabcontent");
//                 let x = key - 112;
//                 u.OpenHTab(HtabList[x].id);
//             }
//             else if (vTabNums.indexOf(key)>=0 && u.ID("Admin").style.display === "block") {// . , 3 , 6 , 9 on numpad for v tabs
//                 event.preventDefault();
//                 let VtabList = document.getElementsByClassName("vtabcontent");
//                 let x = vTabNums.indexOf(key);
//                 u.OpenVTab(x+1);
//             }
//             else if (key > 48 && key < 57 && u.ID("Shopping").style.display === "block") {// 1-7 for shopping tables
//                 event.preventDefault();
//                 let x = key - 49;
//                 shopping.ShowShoppingDiv(x);
//             }
//             break;
//     }
// }

// u.ID('missingItemWizard').addEventListener("click",d.MissingItemWizard);