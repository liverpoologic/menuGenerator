module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var u = require("../../utilities")(DATA);
   var addRecipe = require('./addRecipe.js')(DATA);
   var s = DATA.state;
   var els = DATA.els.admin;

   function generator() {

      window.addEventListener('update', RefreshAllTables);
      window.addEventListener('open_tab', OpenTab);

      CreateTable(1);
      CreateTable(2);
      CreateTable(3);
      CreateTable(4);
      els.selectAdminEnum.addEventListener("change", RefreshEnumTable);

      els.edit_recipe_modal = u.CreateModalFramework('edit_existing_recipe', 'Edit Recipe', 'recipeTitle');
      els.edit_recipe_modal.modalContent.style.width = '900px';
      els.edit_recipe_modal_els = addRecipe.CreatePageEls(els.edit_recipe_modal.content, 'edit');
      els.edit_recipe_modal_els.save_btn.addEventListener('click', function() {
         addRecipe.AddRecipeBtn('editModal_');
         els.edit_recipe_modal.modal.style.display = 'none';
      });

   }

   function RefreshAllTables(EV) {
      console.log('refresh function');
      if (EV.detail.global) {
         if (EV.detail.type === 'config') {
            RefreshEnumTable();
         } else {
            if (s.htab == 'admin') {
               s.adminBehind = false;
               CreateTableContents(1);
               CreateTableContents(2);
               CreateTableContents(3);
            } else {
               s.adminBehind = true;
            }
         }
      }
   }

   function OpenTab(EV) {
      console.log('open tab');
      if (EV.detail.htab == 'admin' && s.adminBehind) {
         console.log('creating table contents');
         CreateTableContents(1);
         CreateTableContents(2);
         CreateTableContents(3);
         s.adminBehind = false;
      }
   }

   /** creates / refreshes a given dictionary admin table */
   function CreateTable(tableID) { // create admin table header and filter row, then calls CreateTableContents (clear existing and then create)
      let parentDiv = u.ID(`t${tableID}_tab_content`);
      let fullFilterDiv = u.CreateEl('div').parent(parentDiv).className('ingredientSearchDiv').end();
      //create Heading and then create table
      let table = u.CreateEl('table').parent(parentDiv).id(`t${tableID}Table`).className('adminTable').end();

      //collect filters to reapply later
      let filters = table.rows[1];
      table.innerHTML = ""; // clear table
      switch (tableID) {
         case 1:
            u.CreateRow("t1Table", "th", ["Food Name", "Unit", "Shop", "Type", "Allergens", ""], "", [30, 10, 12, 13, 20, 5], "%");
            if (filters) table.appendChild(filters);
            else {
               CreateFilterRow(1, ["longText", "longText", "select", "select", "select", null], ['Food Name', 'Unit']);
            }
            break;

         case 2:
            fullFilterDiv.style = 'height:50px';
            let clearIngFilter = u.CreateEl('button').id('clearIngredientSearch').className('insideCellBtn').style('margin-top: 8px; color:var(--dark-grey)').parent(fullFilterDiv).end();
            u.Icon('times', clearIngFilter);
            let ingredientSearch = u.CreateEl('input').type('text').id('ingredientSearchInput').style('margin:4px 10px;').parent(fullFilterDiv).end();
            ingredientSearch.placeholder = 'ingredient';

            u.ID("ingredientSearchInput").addEventListener("change", function() { // event listener so table is recreated when ingredient filter is changed
               CreateTableContents(2);
            });

            u.ID("clearIngredientSearch").addEventListener("click", function() { // event listener to clear table when 'x' is clicked next to ingredient filter
               u.ID("ingredientSearchInput").value = "";
               CreateTableContents(2);
            });

            u.CreateRow("t2Table", "th", ["Recipe Title", "Meal", "Type", "Serves", "Morv", ""], "", [55, 15, 15, 10, 10, 5], "%");
            if (filters) table.appendChild(filters);
            else {
               CreateFilterRow(2, ["longText", "select", "select", null, "select", null], ['Recipe Title']);
            }
            break;
         case 3:
            u.CreateRow("t3Table", "th", ["Menu Title", "Start Date", "End Date", ""], "", [40, 30, 30, 10], "%");

            if (filters) table.appendChild(filters);
            else CreateFilterRow(3, ["longText", null, null, null], ['Menu Title']);
            break;
         case 4:
            els.selectAdminEnum = u.CreateEl('select').id('selectAdminEnum').parent(parentDiv).end();
            els.enumTableDiv = u.CreateEl('div').parent(parentDiv).end();
            break;
      }

   }

   /**create filter row (i.enums. select/text inputs
    * @param {number} dictID id of dictionary (1,2 or 3)
    * @param {array} filterType array including each filter type from left to right c.enums.g. ["longText,"text","number","select",null] - null means no input required.
    * @param {array} placeholders array including any placeholder text required
    */
   function CreateFilterRow(dictID, filterType, placeholders) {
      let tableID = `t${dictID}Table`;
      let Table = u.ID(tableID);
      let filterRow = Table.insertRow();

      filterType.forEach((type, i) => {
         let filterCell = u.CreateEl('th').parent(filterRow).className('cellWithInput').end()
         filterCell.addEventListener("change", function() {
            CreateTableContents(dictID);
         });
         if (type === "select") {
            //create select
            u.CreateEl('select').parent(filterCell).id(`${tableID}Filter${i}input`).value('_default').className('filterSelect').end()
         } else if (type === "longText") {
            u.CreateEl('input').type('text').parent(filterCell).id(`${tableID}Filter${i}input`).style('width:80%').className('filterTextInput').placeholder(placeholders[i]).end()
            let closeBtn = u.CreateEl('button').className('insideCellBtn').parent(filterCell).id(`${tableID}Filter${i}clear`).style('color:var(--dark-grey)').end();
            u.Icon('times', closeBtn);
            u.ID(`${tableID}Filter${i}clear`).addEventListener("click", function() {
               u.ID(`${tableID}Filter${i}input`).value = "";
               CreateTableContents(dictID);
            });
         } else if (type !== null) {
            u.CreateEl('input').type(type).parent(filterCell).id(`${tableID}Filter${i}input`).className('filterTextInput').placeholder(placeholders[i]).end()
         }
      });
   }

   //TODO configurise properly and put date stuff in a function
   /** Refresh contents of a given admin table
    * @param {number} dictID ID of the table (1,2 or 3). */
   function CreateTableContents(dictID) {
      let table = u.ID(`t${dictID}Table`);
      u.ClearTable(table.id, 2);
      let dictKeys = u.GetKeysExFns(d.getDict(dictID)).sort();
      dictKeys.forEach((key, i) => {
         let rowItem = d.getDict(dictID)[dictKeys[i]];
         let j = table.rows.length - 1;

         if (dictID === 1) {
            let filter = Filter(rowItem, key, dictID, [
               ["key", ""],
               ["unit", ""],
               ["shop", "_default"],
               ["foodType", "_default"],
               ["allergens", "_default"]
            ]);
            if (filter === false) {
               return;
            }
            let cellIDs = [`t1TableKey${j}`, `t1TableUnit${j}`, `t1TableShop${j}`, `t1TableFoodType${j}`, `t1TableAllergens${j}`, ''];

            var allergens = rowItem.allergens ? rowItem.allergens.join(", ") : "";
            let cellContents = [dictKeys[i], rowItem.unit, rowItem.shop, rowItem.foodType, allergens, `<button class='removeLineBtn' id=t1RemoveLinebtn${j}></button>`];
            u.CreateRow("t1Table", "td", cellContents, cellIDs);
            u.CreateEditCellListeners(`t1TableUnit${j}`, "text", `t1TableKey${j}`, 1, "unit");
            u.CreateEditCellListeners(`t1TableShop${j}`, "select", `t1TableKey${j}`, 1, "shop", c.enums.shopEnum, false);
            u.CreateEditCellListeners(`t1TableFoodType${j}`, "select", `t1TableKey${j}`, 1, "foodType", c.enums.foodTypeEnum, false);
            u.CreateEditCellListeners(`t1TableAllergens${j}`, "tags", `t1TableKey${j}`, 1, "allergens", 'allergenList');

            u.Icon('minus', u.ID(`t1RemoveLinebtn${j}`))

            // add listener to enable edit food name
            u.ID(`t1TableKey${j}`).addEventListener("click", EditFoodName);
         } else if (dictID === 2) {
            let filter = Filter(rowItem, key, dictID, [
               ["key", ""],
               ["mealType", "_default"],
               ["recipeType", "_default"], null, ["morv", "_default"]
            ]);
            if (filter === false) {
               return;
            }
            filter = FilterIngredient(key); // c1hecks that ingredient isn't being filtered out
            if (filter === false) {
               return;
            }
            let cellIDs = [`t2TableKey${j}`, `t2TableMeal${j}`, `t2TableType${j}`, `t2TableServes${j}`, `t2TableMorv${j}`, ''];
            let cellContents = [dictKeys[i], rowItem.mealType, rowItem.recipeType, rowItem.serves, rowItem.morv, `<button class='removeLineBtn' id=t2RemoveLinebtn${j}></button>`];
            u.CreateRow("t2Table", "td", cellContents, cellIDs);

            u.CreateEditCellListeners(`t2TableMeal${j}`, "select", `t2TableKey${j}`, 2, "mealType", c.enums.mealTypeEnum, false);
            u.CreateEditCellListeners(`t2TableType${j}`, "select", `t2TableKey${j}`, 2, "recipeType", c.enums.recipeTypeEnum, false);
            u.CreateEditCellListeners(`t2TableMorv${j}`, "select", `t2TableKey${j}`, 2, "morv", c.enums.morvEnum, false);

            u.Icon('minus', u.ID(`t2RemoveLinebtn${j}`))

            // create event listener for clicking a recipeTitle in the admin screen and moving to add recipe screen
            u.ID(`t2TableKey${j}`).addEventListener("click", function() {
               let recipe = d.recipes[u.ID(`t2TableKey${j}`).innerText];
               let recipeTitle = u.ID(`t2TableKey${j}`).innerText;
               addRecipe.PopulateValues(Object.assign(recipe, {
                  recipeTitle: recipeTitle
               }), els.edit_recipe_modal_els);
               els.edit_recipe_modal.recipeTitle.innerText = recipeTitle;

               els.edit_recipe_modal.modal.style.display = 'block';

            });
         } else if (dictID === 3) {
            let filter = Filter(rowItem, key, dictID, [
               ["key", ""]
            ]);
            if (filter === false) {
               return;
            }

            // generate display for start and end date
            let rawStartDate = (new Date(rowItem.startDate));
            let rawEndDate = (new Date(rowItem.endDate));

            let startDay = rawStartDate.getDate();
            let startMonth = rawStartDate.getMonth() + 1;
            let startYear = rawStartDate.getFullYear();
            let startDate = `${startDay}/${startMonth}/${startYear}`;

            let endDay = rawEndDate.getDate();
            let endMonth = rawEndDate.getMonth() + 1;
            let endYear = rawEndDate.getFullYear();
            let endDate = `${endDay}/${endMonth}/${endYear}`;
            //

            let cellIDs = [`t3TableKey${j}`, `t3TableStartDate${j}`, `t3TableEndDate${j}`, ''];
            let cellContents = [dictKeys[i], startDate, endDate, `<button class='removeLineBtn' id=t3RemoveLinebtn${j}></button>`];
            u.CreateRow("t3Table", "td", cellContents, cellIDs);

            u.CreateEditCellListeners(`t3TableStartDate${j}`, "date", `t3TableTitle${j}`, 3, "startDate");
            u.CreateEditCellListeners(`t3TableEndDate${j}`, "date", `t3TableTitle${j}`, 3, "endDate");

            u.Icon('minus', u.ID(`t3RemoveLinebtn${j}`))

         }
         // event listener to delete row
         if (u.ID(`t${dictID}RemoveLinebtn${j}`) === null) {
            return;
         }
         u.ID(`t${dictID}RemoveLinebtn${j}`).addEventListener("click", function() {
            let keyToDelete = u.ID(`t${dictID}TableKey${j}`).innerText;
            if (dictID === 1) {
               if (d.foods[keyToDelete].recipeRefCnt > 0) {
                  var recipesWithThisFood = Object.keys(d.recipes).filter(recipeKey => {
                     var recipe = d.recipes[recipeKey]
                     if (typeof recipe === 'function') return false;
                     else return recipe.ingredients.map(ing => ing.foodName).indexOf(keyToDelete) > -1
                  }).map(r => `- ${r}`).join("\n")
                  window.alert(`You cannot delete this food, it is being used in recipes:\n${recipesWithThisFood}.\nPlease edit these recipe(s) and then try again`)
                  return;
               }
            }
            if (dictID === 2) {
               var usedIn = [];
               u.GetKeysExFns(d.menus).forEach(menuTitle => {
                  d.menus[menuTitle].meals.forEach(meal => {
                     meal.recipes.forEach(recipe => {
                        if (recipe.recipeTitle === keyToDelete) {
                           usedIn.push(menuTitle);
                        }
                     });
                  });
               });

               if (usedIn.length > 0) {
                  let menus = usedIn.map(x => `- ${x}`).join("\n");
                  window.alert(`You cannot delete this food, it is being used in menus:\n${menus}.\nPlease edit these menus(s) and then try again`);
                  return;
               }
            }
            d.getDict(dictID).deleteItem(keyToDelete);
            d.write();
         });
         //
      });
   }

   /** allows user to edit the food name in t1Table */
   function EditFoodName() {
      let j = u.GetNumber(event.target.id);
      let cell = u.ID(`t1TableKey${j}`);
      let oldValue = cell.innerText;
      cell.innerText = "";
      cell.className = "tableInput";
      u.CreateEl('input').parent(cell).id(`t1TableFoodNameInput${j}`).value(oldValue).className('insideCellElement').type('text').style('width:90%').end();
      let saveInputBtn = u.CreateEl('button').parent(cell).id(`t1TableFoodNameSave${j}`).className('insideCellBtn').end();
      u.Icon('check', saveInputBtn)
      cell.removeEventListener("click", EditFoodName);
      saveInputBtn.addEventListener("click", function() {
         ChangeFoodName(j, oldValue);
      });
   }

   /** changes the food name from the old value to the current value of the cell, and changes t2 and t3 */
   function ChangeFoodName(j, oldValue) {
      let newValue = u.ID(`t1TableFoodNameInput${j}`).value;
      u.RenameKey(oldValue, newValue, d.foods);
      // check whether food is present in any recipes
      let recipeKeys = u.GetKeysExFns(d.recipes);
      recipeKeys.forEach(recipeKey => {
         let recipe = d.recipes[recipeKey];
         recipe.ingredients.forEach(ing => {
            if (ing.foodName === oldValue) {
               ing.foodName = newValue;
            }
         });
      });
      d.write();
   }

   /** returns false if value should be filtered out, true if the value should be displayed. EG: let filter = Filter(2, i, [["key", ""], null, ["morv", "all"]])
    * @param {object} rowItem the item in the dictionary
    * @param {string} rowKey the key of the item
    * @param {array} parameters  c.enums.g. [["property1", "nullvalue1"],null, ["property2", "nullvalue2"]] note that nullValue would normally be "" or "all" and must be in lower case. use a null string if a column has no filter applied*/
   function Filter(rowItem, rowKey, dictID, parameters) { //returns false if value should be filtered out, true if the value should be displayed

      let filter = [];
      let filterBool = [];

      //convert to lower case to avoid case mismatches
      rowKey = rowKey.toLowerCase();

      for (let i = 0; i < parameters.length; i++) {
         if (parameters[i] === null) {
            filterBool[i] = true;
            continue;
         }
         let property = parameters[i][0]; // this is the property of the dictionary object that is being compared
         if (typeof u.ID(`t${dictID}TableFilter${i}input`).value === "string") { // changes to lower case to ensure no case mismatches
            filter[i] = u.ID(`t${dictID}TableFilter${i}input`).value.toLowerCase();
         } else {
            filter[i] = u.ID(`t${dictID}TableFilter${i}input`).value;
         }
         filterBool[i] = false;
         if (filter[i] === parameters[i][1]) {
            filterBool[i] = true;
            continue;
         }
         if (parameters[i][0] === "key") {
            if (rowKey.indexOf(filter[i]) > -1) {
               filterBool[i] = true;
               continue;
            }
         } else {
            let thingProperty;
            if (typeof rowItem[property] === "string") {
               thingProperty = rowItem[property].toLowerCase();
            } else {
               thingProperty = rowItem[property];
            }

            if (thingProperty === null || thingProperty === undefined) {
               continue;
            } else if (thingProperty.indexOf(filter[i]) > -1) {
               filterBool[i] = true;
            }
         }
      }
      let result = true;
      for (let i = 0; i < filterBool.length; i++) {
         if (filterBool[i] === false) {
            result = false;
         }
      }
      return result;
   }

   /** returns false if a recipe doesn't have the 'ingredient filter' string in any of its ingredients
    * @param {number} recipeKey key for that recipe */
   function FilterIngredient(recipeKey) {
      let filter = u.ID("ingredientSearchInput").value.toLowerCase();
      let ingredients = d.recipes[recipeKey].ingredients;
      let result = false;
      for (let j = 0; j < ingredients.length; j++) {
         let ingredientName = ingredients[j].foodName;
         if (ingredientName.indexOf(filter) > -1) {
            result = true;
            break;
         }
      }
      return result;
   }

   /** saves changes to edited recipe, and returns user to admin screen */
   function SaveChangesRecipe() {
      let recipeTitle = u.ID("recipeTitle").value;
      d.recipes.deleteItem(recipeTitle);
      addRecipe.AddRecipeBtn();

      d.write();
      u.ID("AddRecipePageTitle").innerText = "Add Recipe"; // change text of title back from 'edit recipe' to 'add recipe'
      u.ShowElements("addRecipe_btn", "inline");
      u.HideElements("editRecipe_btn");
      u.OpenHTab("admin");
      u.OpenVTab(2);
   }

   /** displays elements of an enum */
   function RefreshEnumTable() {
      els.enumTableDiv.innerHTML = "";
      let enumName = els.selectAdminEnum.value;
      let enumObj = c.enums[enumName];
      if (enumName === "_default") {
         return false;
      }
      els.enumTable = u.CreateEl('table').className('ingredientTable').parent(els.enumTableDiv).end();

      if (enumName === 'specialsEnum') {
         enumObj = Object.keys(enumObj);
      }

      enumObj.forEach((o, i) => {
         let newRow = els.enumTable.insertRow();
         newRow.row_index = i;

         let name = u.CreateEl('td').innerText(o).parent(newRow).end();

         let up = u.CreateEl('td').parent(newRow).end();
         let upBtn = u.CreateEl('button').parent(up).className('ingredientTableButton').end();
         u.Icon('chevron-up', upBtn);

         let down = u.CreateEl('td').parent(newRow).end();
         let downBtn = u.CreateEl('button').parent(down).className('ingredientTableButton').end();
         u.Icon('chevron-down', downBtn);

         let del = u.CreateEl('td').parent(newRow).end();
         let deleteBtn = u.CreateEl('button').parent(del).className('removeIngredient').end();
         u.Icon('minus', deleteBtn);

         name.addEventListener('click', EditEnumName)
         upBtn.addEventListener('click', function(e) {
            MoveEnumObj(e, 'up')
         });
         downBtn.addEventListener('click', function(e) {
            MoveEnumObj(e, 'down')
         });
         deleteBtn.addEventListener('click', DeleteEnumObj);
      });
      // u.CreateElement("button", els.enumTableDiv, "addEnumItem", "", "add new item");
      // u.ID("addEnumItem").addEventListener("click", AddEnumItem);
   }

   /** allows user to add an item to an enum */
   function AddEnumItem() {
      let enumName = els.selectAdminEnum.value;
      c.enums[enumName].push("");
      c.write();
   }

   /** allows user to edit the enum name */
   function EditEnumName() {
      let j = u.GetNumber(event.target.id);
      let cell = u.ID(`enumObj${j}`);
      let oldValue = cell.innerText;
      cell.innerHTML = `<input type='text' id='enumObjInput${j}' value='${oldValue}'><button id='enumObjSave${j}' class='insideCellBtn'>✔</button>`;
      cell.className = "tableInput";
      u.ID(`enumObj${j}`).removeEventListener("click", EditEnumName);
      u.ID(`enumObjSave${j}`).addEventListener("click", function() {
         ChangeEnumName(oldValue);
      });
   }

   /** changes the food name from the old value to the current value of the cell */
   function ChangeEnumName(oldValue) {
      let j = u.GetNumber(event.target.id);
      let newValue = u.ID(`enumObjInput${j}`).value;
      let enumObj = c.enums[els.selectAdminEnum.value];
      delete enumObj[j];
      enumObj[j] = newValue;
      if (els.selectAdminEnum.value === "foodTypeEnum") { // if you are changing food-type-enum, change types of food in d.foods
         let foodKeys = Object.keys(d.foods);
         for (let i = 0; i < foodKeys.length; i++) {
            let foodName = foodKeys[i];
            let food = d.foods[foodName];
            if (typeof food === "function") {
               continue;
            } else if (food.foodType === oldValue) {
               food.foodType = newValue;
            }
         }
      }
      if (els.selectAdminEnum.value === "shopEnum") { // if you are changing shopping-enum, change types of shop in d.foods
         let foodKeys = Object.keys(d.foods);
         for (let i = 0; i < foodKeys.length; i++) {
            let foodName = foodKeys[i];
            let food = d.foods[foodName];
            if (typeof food === "function") {
               continue;
            } else if (food.shop === oldValue) {
               food.shop = newValue;
            }
         }
      }
      d.write();
      c.write();

   }

   /** moves an enum up or down */
   function MoveEnumObj(ev, direction) {
      let i = ev.target.parent.parent.row_index;
      let enumName = els.selectAdminEnum.value;
      let j;
      j = direction === 'up' ? i - 1 : i + 1
      if (j < -1 || j > c.enums.length) return false;
      u.Swap(c.enums[enumName], i, j);
      c.write();
   }

   function DeleteEnumObj() {
      let i = event.target.parent.parent.row_index;
      let enumName = els.selectAdminEnum.value;
      c.enums[enumName].splice(i, 1);
      c.write();
   }

   return {
      generator: generator
   }
}