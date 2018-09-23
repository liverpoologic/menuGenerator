module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var u = require("../../utilities")(DATA);
   var addRecipe = require('./addRecipe.js')(DATA);

   function generator() {
      // CreateIngredientTable({
      //    firstTime: true
      // });

      u.ID("ingredientSearchInput").addEventListener("change", function() { // event listener so table is recreated when ingredient filter is changed
         CreateTableContents(2);
      });
      u.ID("clearIngredientSearch").addEventListener("click", function() { // event listener to clear table when 'x' is clicked next to ingredient filter
         u.ID("ingredientSearchInput").value = "";
         CreateTableContents(2);
      });
      u.ID("selectAdminEnum").addEventListener("change", RefreshEnumTable);
      window.addEventListener('update', RefreshAllTables)

      // create event listener for 'save changes' button to support t2 > 'edit recipe' functionality
      u.ID("editRecipe_btn").addEventListener("click", SaveChangesRecipe);
   }

   function RefreshAllTables(EV) {
      console.log('refresh all tables');
      console.log(EV);
      if (EV.detail.global) {
         if (EV.detail.type === 'config') {
            RefreshEnumTable();
         }
         CreateTable(1);
         CreateTable(2);
         CreateTable(3);
      }
   }

   /** creates / refreshes a given dictionary admin table */
   function CreateTable(tableID) { // create admin table header and filter row, then calls CreateTableContents (clear existing and then create)
      console.log('creating table');
      console.log(tableID);
      let table = u.ID(`t${tableID}Table`);
      //collect filters to reapply later
      let filters = table.rows[1];
      table.innerHTML = ""; // clear table
      switch (tableID) {
         case 1:
            u.CreateRow("t1Table", "th", ["Food Name", "Unit", "Shop", "Type", "Allergens", "-"], "", [30, 10, 15, 15, 15, 5], "%");
            if (filters) table.appendChild(filters);
            else {
               CreateFilterRow(1, ["longText", "longText", "select", "select", "select", null], [true]);
            }
            break;

         case 2:
            u.CreateRow("t2Table", "th", ["Recipe Title", "Meal", "Type", "Serves", "Morv", "-"], "", [55, 15, 15, 10, 10, 5], "%");
            if (filters) table.appendChild(filters);
            else {
               CreateFilterRow(2, ["longText", "select", "select", null, "select", null]);
            }
            break;
         case 3:
            u.CreateRow("t3Table", "th", ["Menu Title", "Start Date", "End Date", "-"], "", [40, 30, 30, 10], "%");

            if (filters) table.appendChild(filters);
            else CreateFilterRow(3, ["longText", null, null, null]);
            break;
      }

      CreateTableContents(tableID);
   }

   /**create filter row (i.enums. select/text inputs
    * @param {number} dictID id of dictionary (1,2 or 3)
    * @param {array} filterType array including each filter type from left to right c.enums.g. ["longText,"text","number","select",null] - null means no input required. */
   function CreateFilterRow(dictID, filterType) {
      let tableID = `t${dictID}Table`;
      let Table = u.ID(tableID);
      let filterRow = Table.insertRow();

      filterType.forEach((type, i) => {
         let filterCell = u.CreateElement("th", filterRow);
         filterCell.addEventListener("change", function() {
            CreateTableContents(dictID);
         });

         if (type === "select") {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<select id=${tableID}Filter${i}input><option value="All">All</option></select>`);
         } else if (type === "longText") {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<input id=${tableID}Filter${i}input type='text' style='width:80%'><button id=${tableID}Filter${i}clear class='insideCellBtn'>x</button>`);
            u.ID(`${tableID}Filter${i}clear`).addEventListener("click", function() {
               u.ID(`${tableID}Filter${i}input`).value = "";
               CreateTableContents(dictID);
            });
         } else if (type !== null) {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<input id=${tableID}Filter${i}input type='${type}' class='tableTextInput'>`);
         }
      });
   }

   //TODO configurise properly and put date stuff in a function
   /** Refresh contents of a given admin table
    * @param {number} dictID ID of the table (1,2 or 3). */
   function CreateTableContents(dictID, filters) {
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
            let cellContents = [dictKeys[i], rowItem.unit, rowItem.shop, rowItem.foodType, allergens, `<input type='button' value='-' id=t1RemoveLinebtn${j}>`];
            u.CreateRow("t1Table", "td", cellContents, cellIDs);
            u.CreateEditCellListeners(`t1TableUnit${j}`, "text", `t1TableKey${j}`, 1, "unit");
            u.CreateEditCellListeners(`t1TableShop${j}`, "select", `t1TableKey${j}`, 1, "shop", c.enums.shopEnum, false);
            u.CreateEditCellListeners(`t1TableFoodType${j}`, "select", `t1TableKey${j}`, 1, "foodType", c.enums.foodTypeEnum, false);
            u.CreateEditCellListeners(`t1TableAllergens${j}`, "tags", `t1TableKey${j}`, 1, "allergens", 'allergenList');

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
            filter = FilterIngredient(i); // c1hecks that ingredient isn't being filtered out
            if (filter === false) {
               return;
            }
            let cellIDs = [`t2TableKey${j}`, `t2TableMeal${j}`, `t2TableType${j}`, `t2TableServes${j}`, `t2TableMorv${j}`, ''];
            let cellContents = [dictKeys[i], rowItem.mealType, rowItem.recipeType, rowItem.serves, rowItem.morv, `<input type='button' value='-' id=t2RemoveLinebtn${j}>`];
            u.CreateRow("t2Table", "td", cellContents, cellIDs);

            u.CreateEditCellListeners(`t2TableMeal${j}`, "select", `t2TableKey${j}`, 2, "mealType", c.enums.mealTypeEnum, false);
            u.CreateEditCellListeners(`t2TableType${j}`, "select", `t2TableKey${j}`, 2, "recipeType", c.enums.recipeTypeEnum, false);

            // edit morv cell
            u.ID(`t2TableMorv${j}`).addEventListener("click", function editCell() {
               let cell = u.ID(`t2TableMorv${j}`);
               let key = u.ID(`t2TableKey${j}`).innerText;
               let oldValue = d.recipes[key].morv;
               cell.innerHTML = "<select id='Input_t2TableMorv" + j + "'><option>" + oldValue + "</option></select><input type='button' value='✔' id='Save_t2TableMorv" + j + "'>";
               u.CreateDropdown(`Input_t2TableMorv${j}`, c.enums.morvOpts, false);
               cell.className = "tableInput";
               u.ID(`t2TableMorv${j}`).removeEventListener("click", editCell);
               u.ID(`Save_t2TableMorv${j}`).addEventListener("click", function() {
                  let newValue = u.ID(`Input_t2TableMorv${j}`).value;
                  if (newValue === "v / b") {
                     d.recipes[key].morv = ["v", "b"];
                  } else {
                     d.recipes[key].morv = [newValue];
                  }
                  d.write();
               });
            });
            // create event listener for clicking a recipeTitle in the admin screen and moving to add recipe screen
            u.ID(`t2TableKey${j}`).addEventListener("click", function() {
               let recipe = d.recipes[u.ID(`t2TableKey${j}`).innerText];
               let recipeTitle = u.ID(`t2TableKey${j}`).innerText;
               u.SetValues([
                  ["recipeTitle", recipeTitle],
                  ["selectRecipeMealType", recipe.mealType],
                  ["selectRecipeType", recipe.recipeType],
                  ["recipeServes", recipe.serves],
                  ["recipeMethod", recipe.method]
               ]);
               u.ID("AddRecipePageTitle").innerText = "Edit Recipe"; // change 'add recipe' to 'edit recipe' at top of addRecipe tab
               if (recipe.morv.length > 1) {
                  u.ID("recipeMorv").value = "v / b";
               } // if morv is ["v","b"] display "v / b"
               else {
                  u.ID("recipeMorv").value = recipe.morv;
               }
               u.ClearTable("ingredientTable", 1);
               // loop to add ingredients
               recipe.ingredients.forEach((ingredient, i) => {
                  var food = d.foods[ingredient.foodName]
                  addRecipe.AddIngredientsRow();
                  u.SetValues([
                     [`selectIngredientFood${i}`, ingredient.foodName],
                     [`ingredientQuantitySmall${i}`, ingredient.quantity],
                     [`selectIngredientMorv${i}`, ingredient.morv]
                  ]);
                  u.ID(`ingredientUnitDisplay${i}`).innerText = food.unit;
               });
               // open the AddRecipe tab and show 'save changes' button = editRecipe_btn
               u.HideElements("addRecipe_btn");
               u.ShowElements("editRecipe_btn", "inline");
               u.OpenHTab("addRecipe");
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
            let cellContents = [dictKeys[i], startDate, endDate, `<input type='button' value='-' id=t3RemoveLinebtn${j}>`];
            u.CreateRow("t3Table", "td", cellContents, cellIDs);

            u.CreateEditCellListeners(`t3TableStartDate${j}`, "date", `t3TableTitle${j}`, 3, "startDate");
            u.CreateEditCellListeners(`t3TableEndDate${j}`, "date", `t3TableTitle${j}`, 3, "endDate");
         }
         // event listener to delete row
         let deleteRowContents = [null, "deleteFood", "deleteRecipe", "deleteMenu"];
         if (u.ID(`t${dictID}RemoveLinebtn${j}`) === null) {
            return;
         }
         u.ID(`t${dictID}RemoveLinebtn${j}`).addEventListener("click", function() {
            d.getDict(dictID)[deleteRowContents[dictID]](u.ID(`t${dictID}TableKey${j}`).innerText);
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
      cell.innerHTML = `<input type='text' id='t1TableFoodNameInput${j}' value='${oldValue}'><button id='t1TableFoodNameSave${j}' class='insideCellBtn'>✔</button>`;
      cell.className = "tableInput";
      u.ID(`t1TableKey${j}`).removeEventListener("click", EditFoodName);
      u.ID(`t1TableFoodNameSave${j}`).addEventListener("click", function() {
         ChangeFoodName(j, oldValue);
      });
   }

   /** changes the food name from the old value to the current value of the cell, and changes t2 and t3 */
   function ChangeFoodName(j, oldValue) {
      let newValue = u.ID(`t1TableFoodNameInput${j}`).value;
      u.RenameKey(oldValue, newValue, d.foods);
      // check whether food is present in any recipes
      let recipeKeys = Object.keys(d.recipes);
      var impactedRecipes = [];
      for (let k = 0; k < recipeKeys.length; k++) {
         let recipe = d.recipes[recipeKeys[k]];
         if (typeof recipe === "function") {
            continue;
         }
         let ingredientKeys = Object.keys(recipe.ingredients);
         for (let x = 0; x < ingredientKeys.length; x++) {
            if (oldValue === ingredientKeys[x]) {
               u.RenameKey(oldValue, newValue, recipe.ingredients);
               impactedRecipes.push(recipeKeys[k]);
            }
         }
      }
      // check whether food is present in any menus (t3) and change foodName if it is
      let menuKeys = Object.keys(d.menus).sort();
      for (let k = 0; k < menuKeys.length; k++) {
         let menuTitle = menuKeys[k];
         if (typeof d.menus[menuTitle] === "function") {
            continue;
         }
         let mealKeys = Object.keys(d.menus[menuTitle].meals);
         for (let x = 0; x < mealKeys.length; x++) {
            let mealNo = parseInt(mealKeys[x]);
            let recipeKeys = Object.keys(d.menus[menuTitle].meals[mealNo].recipes);
            for (let y = 0; y < recipeKeys.length; y++) {
               let recipeNo = parseInt(recipeKeys[y]);
               let recipe = d.menus.getRecipe(menuTitle, mealNo, recipeNo);
               let recipeTitle = recipe.recipeTitle;
               if (impactedRecipes.indexOf(recipeTitle) > -1) { //is recipe in our array 'impactedRecipes' - if yes, then delete and re-add.
                  let morv = recipe.morv;
                  d.menus.deleteRecipe(menuTitle, mealNo, recipeNo);
                  d.menus.addRecipe(menuTitle, mealNo, recipeTitle, morv);
               }
            }
         }
      }
      d.write();
   }

   /** returns false if value should be filtered out, true if the value should be displayed. EG: let filter = Filter(2, i, [["key", ""], null, ["morv", "all"]])
    * @param {object} rowItem the item in the dictionary
    * @param {string} rowKey the key of the item
    * @param {array} parameters  c.enums.g. [["property1", "nullvalue1"],null, ["property2", "nullvalue2"]] note that nullValue would normally be "" or "all" and must be in lower case. use a null string if a column has no filter applied*/
   function Filter(rowItem, rowKey, dictID, parameters) { //returns false if value should be filtered out, true if the value should be displayed

      let filter = [];
      let filterBool = [];

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
    * @param {number} i number of the sorted d.recipeskey id for that recipe */
   function FilterIngredient(i) {
      let filter = u.ID("ingredientSearchInput").value.toLowerCase();
      let recipeKeys = Object.keys(d.recipes).sort();
      let ingredients = d.recipes[recipeKeys[i]].ingredients;
      let ingredientsKeys = Object.keys(ingredients);
      let result = false;
      for (let j = 0; j < ingredientsKeys.length; j++) {
         let ingredient = ingredientsKeys[j];
         if (ingredient.indexOf(filter) > -1) {
            result = true;
            break;
         }
      }
      return result;
   }

   /** saves changes to edited recipe, and returns user to admin screen */
   function SaveChangesRecipe() {
      let recipeTitle = u.ID("recipeTitle").value;
      d.recipes.deleteRecipe(recipeTitle);
      addRecipe.btn();

      d.write();
      u.ID("AddRecipePageTitle").innerText = "Add Recipe"; // change text of title back from 'edit recipe' to 'add recipe'
      u.ShowElements("addRecipe_btn", "inline");
      u.HideElements("editRecipe_btn");
      u.OpenHTab("admin");
      u.OpenVTab(2);
   }

   /** displays elements of an enum */
   function RefreshEnumTable() {
      u.ID("enumTableDiv").innerHTML = "";
      let enumName = u.ID("selectAdminEnum").value;
      let enumObj = c.enums[enumName];
      if (enumName === "_default") {
         return false;
      }
      u.CreateElement("table", u.ID("enumTableDiv"), "enumTable");

      if (enumName === 'specialsEnum') {
         enumObj = Object.keys(enumObj);
      }

      for (let i = 0; i < enumObj.length; i++) {
         u.CreateRow("enumTable", "td", [enumObj[i], "⇧", "⇩", "×"], [`enumObj${i}`, `enumObjUp${i}`, `enumObjDown${i}`, `enumObjDelete${i}`], [200, 15, 15, 15], "px");
         u.ID(`enumObj${i}`).addEventListener("click", EditEnumName);
         u.ID(`enumObjUp${i}`).addEventListener("click", MoveEnumObj);
         u.ID(`enumObjDown${i}`).addEventListener("click", MoveEnumObj);
         u.ID(`enumObjDelete${i}`).addEventListener("click", DeleteEnumObj);
      }
      u.CreateElement("button", u.ID("enumTableDiv"), "addEnumItem", "", "add new item");
      u.ID("addEnumItem").addEventListener("click", AddEnumItem);
   }

   /** allows user to add an item to an enum */
   function AddEnumItem() {
      let enumName = u.ID("selectAdminEnum").value;
      c.enums[enumName].push("");
      c.write();
   }

   /** allows user to edit the food name in t1Table */
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
      let enumObj = c.enums[u.ID("selectAdminEnum").value];
      delete enumObj[j];
      enumObj[j] = newValue;
      if (u.ID("selectAdminEnum").value === "foodTypeEnum") { // if you are changing food-type-enum, change types of food in d.foods
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
      if (u.ID("selectAdminEnum").value === "shopEnum") { // if you are changing shopping-enum, change types of shop in d.foods
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
   function MoveEnumObj() {
      let i = u.GetNumber(event.target.id);
      let enumName = u.ID("selectAdminEnum").value;
      let j;
      if (event.target.id.charAt(7) === "U") {
         j = i - 1;
      } else {
         j = i + 1;
      }
      if (j < -1 || j > c.enums.length) return false;
      u.Swap(c.enums[enumName], i, j);
      d.write();
      c.write();
   }

   function DeleteEnumObj() {
      let i = u.GetNumber(event.target.id);
      let enumName = u.ID("selectAdminEnum").value;
      c.enums[enumName].splice(i, 1);
      d.write();
      c.write();
   }

   return {
      generator: generator
   }
}