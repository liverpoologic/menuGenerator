const ipc = require('electron').ipcRenderer;

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);

   var shopBtnStatus = [];


   function generator() {
      u.ID("selectMenuForShopping").addEventListener("change", RefreshLists);
      u.ID("printShoppingbtn").addEventListener('click', PrintShopping);
      window.addEventListener('update', UpdateListener)

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
      var shoppingDiv = u.ID("shopping");
      var shoppingBtnDiv = u.ID("shoppingbtndiv");
      shoppingBtnDiv.innerHTML = "";

      for (let i = 0; i < c.enums.shopEnum.length; i++) { // initialise buttons
         shopBtnStatus[i] = {
            shopName: c.enums.shopEnum[i],
            empty: false,
            active: false
         };
      }
      console.log(shoppingDiv);

      for (let i = 0; i < c.enums.shopEnum.length; i++) { // create buttons
         let shop = c.enums.shopEnum[i];
         let btnid = shop.replace(' ', '_');
         let btn = u.CreateElement("button", shoppingBtnDiv, `shoppingbtn${btnid}`, "shoppingbtn", shop, "none");
      }
      for (let i = 0; i < c.enums.shopEnum.length; i++) { // create divs and tables
         let shop = c.enums.shopEnum[i];
         let div = u.CreateElement("div", shoppingDiv, `shoppingdiv${shop}`, "", "", "none");
         let shoppingTable = u.CreateElement("table", div, `shoppingtable${shop}`, "shoppingTable");
      }
      for (let i = 0; i < c.enums.shopEnum.length; i++) { // add event listeners to show/hide divs on button click
         let btnid = c.enums.shopEnum[i].replace(' ', '_');
         u.ID(`shoppingbtn${btnid}`).addEventListener("click", function() {
            ShowShoppingDiv(i);
         });
      }
      RefreshLists();
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
      console.log('in refresh lists')
      console.log(u.ID("selectMenuForShopping"));
      let btns = [];
      for (let i = 0; i < c.enums.shopEnum.length; i++) { // create list of button IDs
         let btnid = c.enums.shopEnum[i].replace(' ', '_');
         btns.push(`shoppingbtn${btnid}`);
      }
      let menuTitle = u.ID("selectMenuForShopping").value;
      console.log(u.ID("selectMenuForShopping").value);
      if (menuTitle === "_default" || !menuTitle) {
         u.HideElements(btns);
         return "error - no menuTitle present";
      }
      console.log(btns);
      u.ShowElements(btns, "inline");
      for (let i = 0; i < c.enums.shopEnum.length; i++) {
         let shop = c.enums.shopEnum[i];
         u.ClearTable(`shoppingtable${shop}`, 0);
         let rowNumber = 0;
         let menu = d.menus.getMenu(menuTitle);
         menu.meals.forEach((meal, meal_index) => {
            meal.recipes.forEach(menuRecipe => {
               let recipe = d.recipes[menuRecipe.recipeTitle];
               recipe.ingredients.forEach(ingredient => {
                  let food = d.foods[ingredient.foodName];
                  var qLarge = u.CalculateQLarge(menuTitle, meal_index, menuRecipe, ingredient);
                  if (food.shop === shop) {
                     let numberOfRows = u.ID(`shoppingtable${shop}`).rows.length;
                     if (numberOfRows === 0) {
                        let cellIDs = [];
                        for (let x = 0; x < 3; x++) { // add list of ids to an array
                           cellIDs[x] = `${shop}row${rowNumber}col${x}`;
                        }
                        u.CreateRow(`shoppingtable${shop}`, "td", [ingredient.foodName, qLarge, food.unit], cellIDs, [220, 40, 80], "px");
                        rowNumber++;
                     } else {
                        for (let m = 0; m < numberOfRows; m++) {
                           if (u.ID(`${shop}row${m}col0`).innerText === ingredient.foodName) {
                              let currentValue = parseFloat(u.ID(`${shop}row${m}col1`).innerText);
                              let newValue = currentValue + qLarge;
                              u.ID(`${shop}row${m}col1`).innerText = newValue;
                              break;
                           } else if (m === numberOfRows - 1) {
                              let cellIDs = [];
                              for (let x = 0; x < 3; x++) {
                                 cellIDs[x] = `${shop}row${rowNumber}col${x}`;
                              }
                              u.CreateRow(`shoppingtable${shop}`, "td", [ingredient.foodName, qLarge, food.unit], cellIDs);
                              rowNumber++;
                           } else {
                              continue;
                           }
                        }
                     }
                  }
               });
            });
         });
         let numberOfRows = u.ID(`shoppingtable${shop}`).rows.length;
         if (numberOfRows === 0) {
            shopBtnStatus[i].empty = true;
            continue;
         }
         shopBtnStatus[i].empty = false;
         for (let n = 0; n < numberOfRows; n++) {
            let col = [];
            for (let x = 0; x < 3; x++) { // col is now an array with the three cells.
               col[x] = u.ID(`${shop}row${n}col${x}`);
            }
            let unit = null;
            let quantityLarge = parseFloat(col[1].innerText);
            if (col[2].innerText !== null) {
               unit = col[2].innerText;
            }
            let display = u.DisplayIngredient(null, quantityLarge, unit);
            col[1].innerText = display[1];
            col[2].innerText = display[2];
         }
      }
      SetButtonColour();
   }

   /** show a given shopping div and hide the rest
    * @param {number} i the number of the shop (0=bakers, etc.) */
   function ShowShoppingDiv(i) {
      for (let j = 0; j < c.enums.shopEnum.length; j++) {
         if (i === j) {
            u.ShowElements(`shoppingdiv${c.enums.shopEnum[j]}`, "block");
            shopBtnStatus[j].active = true;
         } else {
            u.HideElements(`shoppingdiv${c.enums.shopEnum[j]}`);
            shopBtnStatus[j].active = false;
         }
      }
      SetButtonColour();
   }

   function SetButtonColour() {
      for (let i = 0; i < shopBtnStatus.length; i++) {
         let btnid = c.enums.shopEnum[i].replace(' ', '_');
         let btn = u.ID(`shoppingbtn${btnid}`);
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
      generator: generator
   };
}