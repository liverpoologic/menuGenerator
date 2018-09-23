module.exports = function(DATA) {

   var u = require("../../utilities")(DATA);

   /**writes config to json*/
   function WriteConfig() {
      DATA.config.write();

      let admin = require("./tabs/admin.js");
      admin.CreateTable(1);
      admin.CreateTable(2);
      admin.CreateTable(3);
      admin.RefreshEnumTable();

      let shopping = require("./tabs/shopping.js");
      shopping.RefreshButtons();

      let viewMenu = require("./tabs/viewMenu.js");
      let editMenu = require("./tabs/editMenu.js");
      editMenu.RefreshEditMenu();
      viewMenu.RefreshViewMenu();

      var dropdowns = require('./createDropdowns.js');
      dropdowns.RefreshDropdowns(Dict, Config);
      dropdowns.RefreshDataLists(Dict, Config);
   }

   /**writes a selected dictionary to Dict.json. 'dictID' should be '1,2,3 or 0 to represent all
    * @param {*} dictID the id of the dictionary (1,2,3) or 0 to write all dictionaries */
   function WriteDict(dictID) {
      var fileName = remote.getGlobal('sharedObject').fileNames.core.dict;
      fs.writeFileSync(`./resources/${fileName}`, JSON.stringify(Dict), {
         encoding: "utf8"
      });

      let admin = require("./tabs/admin.js");
      if (dictID === 0) {
         admin.CreateTable(1);
         admin.CreateTable(2);
         admin.CreateTable(3);
      } else {
         admin.CreateTable(dictID);
      }

      let editMenu = require("./tabs/editMenu.js");
      editMenu.RefreshEditMenu();

      let viewMenu = require("./tabs/viewMenu.js");
      viewMenu.RefreshViewMenu();

      var dropdowns = require('./createDropdowns.js');
      dropdowns.RefreshDropdowns(Dict, Config);
      dropdowns.RefreshDataLists(Dict, Config);
   }


   return {
      //    Initialise: Initialise, // creates an htab button
   };
}