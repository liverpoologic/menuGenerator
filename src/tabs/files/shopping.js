const ipc = require('electron').ipcRenderer;

// TODO: click on something in shopping list and see where the ingredient comes from

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);

   var shopBtnStatus = [];
   var ELS;

   function generator(hTabEls) {

      var tabcontent = u.ID('shopping_tab_content');
      ELS = CreatePageEls(tabcontent);
      ELS.selectMenu = hTabEls.selectMenu;
      ELS.printMenu = hTabEls.printMenu;

      ELS.selectMenu.addEventListener("change", RefreshLists);
      ELS.printMenu.addEventListener("click", PrintShopping);

      window.addEventListener('update', UpdateListener);

   }

   function CreatePageEls(parentDiv) {
      var els = {};

      els.btnDiv = u.CreateEl('div').parent(parentDiv).className('editButtonDiv').end();
      els.shoppingBtnDiv = u.CreateEl('div').className('shoppingBtnDiv').parent(parentDiv).end();
      els.shoppingDiv = u.CreateEl('div').parent(parentDiv).end();

      return els;
   }

   function UpdateListener(EV) {
      if (EV.detail.type === 'config') {
         RefreshButtons();
      } else if (EV.detail.type === 'dict') {
         RefreshLists();
      }

   }
   /** refreshes the buttons in the 'shopping' tab */
   function RefreshButtons() {
      ELS.shoppingBtnDiv.innerHTML = "";
      ELS.shoppingDiv.innerHTML = "";

      c.enums.shopEnum.forEach((shop, i) => {
         shopBtnStatus[i] = {
            shopName: shop,
            empty: false,
            active: false
         };
      });

      ELS.btns = [];
      ELS.divs = [];
      ELS.tables = [];

      //work out btn width. 827 for 820 width plus margin at far right
      var btnWidth = 827 / c.enums.shopEnum.length - 7;

      c.enums.shopEnum.forEach((shop, i) => {
         let btn = u.CreateEl('button').parent(ELS.shoppingBtnDiv).className('shoppingbtn').style(`width:${btnWidth}px`).innerText(shop).end();
         ELS.btns.push(btn);
         let div = u.CreateEl('div').parent(ELS.shoppingDiv).style('display:none').className('shoppingTableDiv').end();
         ELS.divs.push(div);
         let shoppingTable = u.CreateEl('table').parent(div).className('shoppingTable').end();
         ELS.tables.push(shoppingTable);

         btn.addEventListener("click", function() {
            ShowShoppingDiv(i);
         });

         RefreshLists();
      });
   }

   /** prints the shopping list as shown on shopping tab */
   function PrintShopping() {
      let menuTitle = u.ID("selectMenuForShopping").value.replace("/", "-");
      let filePath = u.ID("filepath").value;
      let rand = (Math.random() * 1000).toFixed(0);
      if (menuTitle === "Menu") {
         alert("menu not selected - please select menu");
         return false;
      } else if (filePath === "") {
         alert("file path not chosen; please enter a file path");
         u.ShowElements("settingsModal", "block");
         return false;
      }
      u.ShowElements("PrintShopping", "block");
      GeneratePrintShopping();
      u.HideElements("mainApp");
      ipc.send('print-to-pdf', `${filePath}/${menuTitle}_shopping_${rand}.pdf`);
      return true;
   }

   /** Generates the 'print shopping' div with detail from current shopping tables */
   function GeneratePrintShopping() {
      let shoppingDiv = u.ID("PrintShopping");
      shoppingDiv.innerHTML = "";
      let menuTitle = u.ID("selectMenuForShopping").value;
      c.enums.shopEnum.forEach((shop, i) => {
         let shoppingTable = u.ID(`shoppingtable${shop}`);
         if (shoppingTable.innerHTML === "") {
            return;
         } //check if table is empty
         let printShoppingListTitle = u.CreateElement("h2", shoppingDiv, `printShoppingTitle${i}`, "printShoppingList", `${menuTitle} - ${shop}`);
         // create array with list of foods from shopping table with row number as a property
         let foodList = [];
         for (let j = 0; j < shoppingTable.rows.length; j++) {
            let foodName = u.ID(`${shop}row${j}col0`).innerText;
            foodList[foodName] = {
               foodName: foodName,
               rowNumber: j
            };
         }
         let foodListKeys = Object.keys(foodList);
         foodListKeys.sort();
         if (foodListKeys.length > 10) {
            foodListKeys.sort(u.CompareFoodType);
         }
         // print shopping list
         let printShoppingTable = u.CreateElement("table", shoppingDiv, `printshoppingtable${shop}`, "printShoppingTable");
         let rowNumber = 0;
         foodListKeys.forEach((foodName, k) => {
            if (foodListKeys.length > 10 && k > 0 && d.foods[foodName].foodType !== d.foods[foodListKeys[k - 1]].foodType) {
               let printShoppingTableRow = u.ID(`printshoppingtable${shop}`).insertRow(rowNumber);
               printShoppingTableRow.innerHTML = "<td colspan=3 style='background-color:grey'></td>";
               rowNumber++;
            }
            let HTML = [];
            let tableRowNumber = foodList[foodName].rowNumber;
            for (let x = 0; x < 3; x++) {
               HTML[x] = u.ID(`${shop}row${tableRowNumber}col${x}`).innerText;
            }
            u.CreateRow(`printshoppingtable${shop}`, "td", HTML, "", [200, 50, 50], "px");
            rowNumber++;
         });
         if (i === 1) {
            let essentialsNote = u.CreateElement("p", shoppingDiv, "", "essentialsNote", "Don't forget to buy essentials: olive oil, milton, tea/coffee, tupperware, cocoa, biscuits");
         }
      });
   }

   /** refresh shopping lists in response to new menu */
   function RefreshLists() {
      let menuTitle = ELS.selectMenu.value;
      if (menuTitle === "_default" || !menuTitle) {
         ELS.btns.forEach(btn => btn.style.display = 'none')
         return "error - no menuTitle present";
      }
      ELS.btns.forEach(btn => btn.style.display = 'inline')
      ELS.tables.forEach(table => table.innerHTML = "");

      //create an objects where each key is one ingredient.
      var indexedIngredients = {};

      let menu = d.menus.getMenu(menuTitle);
      menu.meals.forEach((meal, meal_index) => {
         meal.recipes.forEach(menuRecipe => {
            let recipe = d.recipes[menuRecipe.recipeTitle];
            recipe.ingredients.forEach(ingredient => {
               let food = d.foods[ingredient.foodName];
               var qLarge = u.CalculateQLarge(menuTitle, meal_index, menuRecipe, ingredient);
               if (Object.keys(indexedIngredients).indexOf(ingredient.foodName) > -1) {
                  indexedIngredients[ingredient.foodName].quantity = indexedIngredients[ingredient.foodName].quantity + qLarge;
               } else {
                  indexedIngredients[ingredient.foodName] = {
                     quantity: qLarge,
                     unit: food.unit,
                     shop: food.shop
                  }
               }
            })
         });
      });

      c.enums.shopEnum.forEach((shop, i) => {
         //create the table
         Object.keys(indexedIngredients).sort().forEach(foodName => {
            let food = indexedIngredients[foodName];
            if (food.shop == shop) {
               let thisRow = u.CreateEl('tr').parent(ELS.tables[i]).end();
               // work out display unit
               let display = u.DisplayIngredient(null, food.quantity, food.unit);
               [foodName, display[1], display[2]].forEach((ea, x) => {
                  u.CreateEl('td').parent(thisRow).innerText(ea).end();
               });
            }
         });

         let numberOfRows = ELS.tables[i].rows.length;
         if (numberOfRows === 0) {
            shopBtnStatus[i].empty = true;
            return;
         }
         shopBtnStatus[i].empty = false;
      });
      SetButtonColour();
   };

   /** show a given shopping div and hide the rest
    * @param {number} i the number of the shop (0=bakers, etc.) */
   function ShowShoppingDiv(i) {
      ELS.divs.forEach(div => div.style.display = 'none')
      shopBtnStatus.forEach(btnStatus => btnStatus.active = false);
      ELS.divs[i].style = 'display:block';
      shopBtnStatus[i].active = true;

      SetButtonColour();
   }

   function SetButtonColour() {
      for (let i = 0; i < shopBtnStatus.length; i++) {
         let btn = ELS.btns[i];
         if (shopBtnStatus[i].active) {
            if (shopBtnStatus[i].empty) {
               btn.className = "shoppingbtn-active-empty";
            } else {
               btn.className = "shoppingbtn-active";
            }
         } else if (shopBtnStatus[i].empty) {
            btn.className = "shoppingbtn-empty";
         } else {
            btn.className = "shoppingbtn";
         }
      }
   }

   return {
      generator: generator,
      ShowShoppingDiv: ShowShoppingDiv
   };
}