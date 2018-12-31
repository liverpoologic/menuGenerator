const ipc = require('electron').ipcRenderer;

// TODO: click on something in shopping list and see where the ingredient comes from

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);
   const els = DATA.els.edit.shopping;

   var shopBtnStatus = [];

   function generator() {
      var tabcontent = u.ID('shopping_tab_content');
      CreatePageEls(tabcontent);

      DATA.els.edit.selectMenu.addEventListener("change", RefreshLists);

      window.addEventListener('update', UpdateListener);

   }

   function CreatePageEls(parentDiv) {
      els.btnDiv = u.CreateEl('div').parent(parentDiv).className('editButtonDiv').end();
      els.shoppingBtnDiv = u.CreateEl('div').className('shoppingBtnDiv').parent(parentDiv).end();
      els.shoppingDiv = u.CreateEl('div').parent(parentDiv).end();
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
      els.shoppingBtnDiv.innerHTML = "";
      els.shoppingDiv.innerHTML = "";

      c.enums.shopEnum.forEach((shop, i) => {
         shopBtnStatus[i] = {
            shopName: shop,
            empty: false,
            active: false
         };
      });

      els.btns = [];
      els.divs = [];
      els.tables = [];
      els.moreInfoTables = [];

      //work out btn width. 827 for 820 width plus margin at far right
      var btnWidth = 827 / c.enums.shopEnum.length - 7;

      c.enums.shopEnum.forEach((shop, i) => {
         let btn = u.CreateEl('button').parent(els.shoppingBtnDiv).className('shoppingbtn').style(`width:${btnWidth}px`).innerText(shop).end();
         els.btns.push(btn);
         let div = u.CreateEl('div').parent(els.shoppingDiv).style('display:none').className('shoppingTableDiv').end();
         els.divs.push(div);

         let leftDiv = u.CreateEl('div').style('float:left').parent(div).end();
         let shoppingTable = u.CreateEl('table').parent(leftDiv).className('shoppingTable').end();
         els.tables.push(shoppingTable);

         let rightDiv = u.CreateEl('div').className('moreInfoBox').parent(div).end();
         let moreInfoTable = u.CreateEl('table').parent(rightDiv).className('moreInfoTable').end();
         els.moreInfoTables.push(moreInfoTable);

         btn.addEventListener("click", function() {
            ShowShoppingDiv(i);
         });

         RefreshLists();
      });
   }

   /** prints the shopping list as shown on shopping tab */
   function PrintShopping() {
      let menuTitle = DATA.els.edit.selectMenu.value;
      let filePath = 'C:/Users/Lisa Karlin/Documents/Menus';
      let rand = (Math.random() * 1000).toFixed(0);
      if (menuTitle === "_default") {
         alert("menu not selected - please select menu");
         return false;
      } else if (filePath === "") {
         alert("file path not chosen; please enter a file path");
         u.ShowElements("settingsModal", "block");
         return false;
      }
      u.ShowElements("print_shopping", "block");
      GeneratePrintShopping(menuTitle);
      u.HideElements("mainApp");
      let sanitisedMenuTitle = menuTitle.replace(/\//g, "-");
      ipc.send('print-to-pdf', `${filePath}/${sanitisedMenuTitle}_shopping_${rand}.pdf`);
      return true;
   }

   /** Generates the 'print shopping' div with detail from current shopping tables */
   function GeneratePrintShopping(menuTitle) {
      let shoppingDiv = u.ID("print_shopping");
      shoppingDiv.innerHTML = "";

      let isFirst = true;
      c.enums.shopEnum.forEach((shop, i) => {
         let shoppingTable = els.tables[i];
         //check if table is empty
         if (shoppingTable.rows.length < 1) {
            return;
         }

         // create title for this shop
         let printShoppingListTitle = u.CreateEl('h2').parent(shoppingDiv).className('printShoppingList').innerText(`${shop} (${menuTitle})`).end();

         //if its the first shop, give it the first class as well
         if (isFirst) {
            isFirst = false;
            printShoppingListTitle.className = 'printShoppingListFirst';
         }

         // create table for the list
         let printShoppingListTable = u.CreateEl('table').parent(shoppingDiv).className('printShoppingTable').innerHTML(shoppingTable.innerHTML).end();

         // // create array with list of foods from shopping table with row number as a property
         // let foodList = [];
         // // go through each row and column
         // for (let j = 0; j < shoppingTable.rows.length; j++) {
         //    let foodName = u.ID(`${shop}row${j}col0`).innerText;
         //    foodList[foodName] = {
         //       foodName: foodName,
         //       rowNumber: j
         //    };
         // }
         // let foodListKeys = Object.keys(foodList);
         // foodListKeys.sort();
         // if (foodListKeys.length > 10) {
         //    foodListKeys.sort(u.CompareFoodType);
         // }
         // // print shopping list
         // let printShoppingTable = u.CreateElement("table", shoppingDiv, `printshoppingtable${shop}`, "printShoppingTable");
         // let rowNumber = 0;
         // foodListKeys.forEach((foodName, k) => {
         //    if (foodListKeys.length > 10 && k > 0 && d.foods[foodName].foodType !== d.foods[foodListKeys[k - 1]].foodType) {
         //       let printShoppingTableRow = u.ID(`printshoppingtable${shop}`).insertRow(rowNumber);
         //       printShoppingTableRow.innerHTML = "<td colspan=3 style='background-color:grey'></td>";
         //       rowNumber++;
         //    }
         //    let HTML = [];
         //    let tableRowNumber = foodList[foodName].rowNumber;
         //    for (let x = 0; x < 3; x++) {
         //       HTML[x] = u.ID(`${shop}row${tableRowNumber}col${x}`).innerText;
         //    }
         //    u.CreateRow(`printshoppingtable${shop}`, "td", HTML, "", [200, 50, 50], "px");
         //    rowNumber++;
         // });
         if (i === 1) {
            let essentialsNote = u.CreateElement("p", shoppingDiv, "", "essentialsNote", "Don't forget to buy essentials: olive oil, milton, tea/coffee, tupperware, cocoa, biscuits");
         }
      });
   }

   /** refresh shopping lists in response to new menu */
   function RefreshLists() {
      let menuTitle = DATA.els.edit.selectMenu.value;
      if (menuTitle === "_default" || !menuTitle) {
         els.btns.forEach(btn => btn.style.display = 'none')
         return "error - no menuTitle present";
      }
      els.btns.forEach(btn => btn.style.display = 'inline')
      els.tables.forEach(table => table.innerHTML = "");

      //create an object where each key is one ingredient.
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
                  indexedIngredients[ingredient.foodName].recipes.push({
                     meal: meal,
                     recipeTitle: menuRecipe.recipeTitle,
                     quantity: qLarge
                  })
               } else {
                  indexedIngredients[ingredient.foodName] = {
                     quantity: qLarge,
                     unit: food.unit,
                     shop: food.shop,
                     foodType: food.foodType,
                     recipes: [{
                        meal: meal,
                        recipeTitle: menuRecipe.recipeTitle,
                        quantity: qLarge
                     }]
                  }
               }
            })
         });
      });

      c.enums.shopEnum.forEach((shop, i) => {
         //create the table
         let lastFoodType;
         Object.keys(indexedIngredients).sort(u.CompareFoodType).forEach(foodName => {
            let food = indexedIngredients[foodName];
            if (food.shop === shop) {

               // check that its the same type
               if (lastFoodType != food.foodType) {
                  if (lastFoodType) {
                     //add extra break row (only if last food type exists - i.e. not at the top of the table)
                     let breakRow = u.CreateEl('tr').parent(els.tables[i]).className('breakRow').end();
                     for (let i = 0; i < 3; i++) {
                        u.CreateEl('td').parent(breakRow).end();
                     }

                  }

                  // update last food type
                  lastFoodType = food.foodType;

               }
               let thisRow = u.CreateEl('tr').parent(els.tables[i]).end();

               // work out display unit
               let display = u.DisplayIngredient(null, food.quantity, food.unit);
               [foodName, display[1], display[2]].forEach((ea, x) => {
                  u.CreateEl('td').parent(thisRow).innerText(ea).end();
               });

               thisRow.addEventListener('click', function() {
                  let thisTable = els.moreInfoTables[i];
                  thisTable.innerHTML = "";
                  food.recipes.forEach(recipe => {
                     let newRow = thisTable.insertRow();

                     let thisDisplay = u.DisplayIngredient(null, recipe.quantity, food.unit);
                     let thisDay = c.enums.weekday[new Date(recipe.meal.date).getDay()];

                     let thisIng = food.unit === null ? thisDisplay[1] : `${thisDisplay[1]} ${thisDisplay[2]}`

                     u.CreateEl('td').parent(newRow).innerHTML(`<b>${thisIng}</b>`).end();
                     u.CreateEl('td').parent(newRow).innerHTML(`${recipe.recipeTitle}`).end();
                     u.CreateEl('td').parent(newRow).innerHTML(`${thisDay} ${recipe.meal.mealType}`).end();

                  })
                  //  els.moreInfos[i].innerText = food.recipes.map(x => x.recipeTitle).join("<br>");
               });
               //Friday Dinner - Recipe Title: 140ml
               // Saturday Lunch - Recipe Title: 500ml

            }
         });

         let numberOfRows = els.tables[i].rows.length;
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
      els.divs.forEach(div => div.style.display = 'none')
      shopBtnStatus.forEach(btnStatus => btnStatus.active = false);
      els.divs[i].style = 'display:block';
      shopBtnStatus[i].active = true;

      SetButtonColour();
   }

   function SetButtonColour() {
      for (let i = 0; i < shopBtnStatus.length; i++) {
         let btn = els.btns[i];
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
      PrintShopping: PrintShopping,
      ShowShoppingDiv: ShowShoppingDiv
   };
}