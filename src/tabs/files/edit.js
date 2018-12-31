module.exports = function(DATA) {
   var vtabs = ['viewMenu', 'editMenu', 'people', 'shopping'];
   var tabs = {};

   var u = require("../../utilities")(DATA);
   vtabs.forEach(vtab => {
      tabs[vtab] = require(`./${vtab}.js`)(DATA);
   });

   function generator() {
      let els = DATA.els.edit;
      //create pageTitle and select menu dropdowns
      var parentDiv = u.ID('edit_tab_content_div');
      u.ID('edit_page_title').innerText = 'Select Menu';
      els.selectMenu = u.CreateEl('select').id('selectEditMenu').parent(parentDiv).style('width:300px').end();
      els.printMenu = u.CreateEl('button').parent(parentDiv).style('float:right; width:200px').end();

      u.Icon('file-pdf', els.printMenu);
      u.CreateEl('text').innerText('Export to PDF').style('margin-left:5px').parent(els.printMenu).end();

      els.printMenu.addEventListener("click", () => {
         // tabs.shopping.PrintShopping();
         // setTimeout(
         // function() {
         tabs.viewMenu.PrintMenu();
         // }, 3000);
      });

      vtabs.forEach(vtab => {
         u.ID(`${vtab}_tab_content`).style = 'margin-top:118px';
         tabs[vtab].generator();
      });

      els.selectMenu.addEventListener('change', function() {
         var divs = document.getElementsByClassName('showOnVtab');
         Array.prototype.forEach.call(divs, div => {
            div.style.display = event.target.value == '_default' ? 'none' : 'block';
         });
      });
   }

   return {
      generator: generator,
   };
};