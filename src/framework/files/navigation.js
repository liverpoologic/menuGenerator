module.exports = function(DATA) {

   var u = require("../../utilities")(DATA);

   function Initialise(tabList, isTest) {
      var mainApp = u.ID('mainApp');
      var errors = u.CreateEl('div').id('errors').parent(mainApp).end();
      var htab_div = u.CreateEl('div').id('htab_div').className('htab').parent(mainApp).end();

      if (isTest) u.ID('errors').innerText = 'Test Mode';

      tabList.forEach(tabConfig => {
         var btn = u.CreateEl('button').parent(htab_div).className('htab_btns').id(`${tabConfig.id}_tab_btn`).innerText(tabConfig.label).end();
         var div = u.CreateEl('div').parent(mainApp).className('htabcontent').id(`${tabConfig.id}_tab_content`).end();
         div.style.display = 'none';
         btn.addEventListener('click', function() {
            u.OpenHTab(tabConfig.id);
         });

         //create vtab div
         var vtab_div = u.CreateEl('div').parent(div).className('vtab').id(`${tabConfig.id}_vtab_div`).end();
         tabConfig.vtabs.forEach(vTabConfig => {
            var btn = u.CreateEl('button').parent(vtab_div).className('vtab_btns').id(`${vTabConfig.id}_tab_btn`).innerText(vTabConfig.label).end();
            var v_div = u.CreateEl('div').parent(div).className('vtabcontent').id(`${vTabConfig.id}_tab_content`).end();
            v_div.style.display = 'none';
            btn.addEventListener('click', function() {
               u.OpenVTab(vTabConfig.id);
            });
         });

      });

      let settingsbtn = u.CreateEl('button').parent(htab_div).id('settings_btn').style('float:right; margin:0px').innerHTML('<img src="../../resources/settings.png" height="15px" width="15px"/>').end()

      // create event listener for 'settings' button
      settingsbtn.addEventListener("click", function() {
         u.ID("filepath").value = DATA.config.filepath;
         u.ShowElements("settingsModal", "block");
      });

   }

   return {
      Initialise: Initialise, // creates an htab button
   };
}