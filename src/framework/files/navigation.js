module.exports = function(DATA) {

   var u = require("../../utilities")(DATA);

   function Initialise(tabList, isTest) {
      var htab_div = u.ID('htab_div')
      tabList.forEach(tabConfig => {
         var btn = u.CreateEl('button').parent(htab_div).className('htablinks').id(`${tabConfig.id}_tab_btn`).innerText(tabConfig.label).end();
         btn.addEventListener('click', function() {
            u.OpenHTab(tabConfig.id)
         });
      });
      if (isTest) u.ID('pageTitle').innerText = 'Pigotts Menu Generator - Test Mode';

      // create event listener for 'settings' button
      u.ID("settings_btn").addEventListener("click", function() {
         u.ID("filepath").value = DATA.config.filepath;
         u.ShowElements("settingsModal", "block");
      });

   }

   return {
      Initialise: Initialise, // creates an htab button
   };
}