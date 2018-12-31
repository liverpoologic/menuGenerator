module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var e = c.enums;
   var u = require("../../utilities")(DATA);
   var els = DATA.els.create.addRecipe;

   function generator() {

      var tabcontent = u.ID('addRecipe_tab_content');
      els = CreatePageEls(tabcontent, 'add');

      els.save_btn.addEventListener("click", function() {
         AddRecipeBtn('create_');
      });

   }

   // p is the parent div which the content will be added to
   function CreatePageEls(parentDiv, mode) {
      let ourEls = {};
      console.log('CREATING PAGE ELS');
      console.log(mode);
      console.log(parentDiv);
      var btnText = mode === 'add' ? 'Add Recipe' : 'Save Changes';
      var idPrefix = mode === 'add' ? 'create_' : 'editModal_';

      ourEls.recipeTitle = u.CreateEl('input').type('text').placeholder('Recipe Title').style('width:100%').parent(parentDiv).end();

      ourEls.subBox = u.CreateEl('div').parent(parentDiv).style('height:70px').end();

      ourEls.left = u.CreateEl('div').style('width:340px; margin:0; float:left').parent(ourEls.subBox).end();
      ourEls.right = u.CreateEl('div').style('width:465px; margin:0; float:right').parent(ourEls.subBox).end();

      u.Br(parentDiv);
      ourEls.mealType = u.CreateEl('select').id(`${idPrefix}selectRecipeMealType`).parent(ourEls.left).end();
      u.Br(els.left);
      ourEls.recipeType = u.CreateEl('select').id(`${idPrefix}selectRecipeType`).parent(ourEls.left).end();

      ourEls.morv = u.CreateEl('select').id(`${idPrefix}recipeMorv`).parent(ourEls.right).end();
      u.Br(ourEls.right);
      ourEls.serves = u.CreateEl('input').type('number').placeholder('serves').parent(ourEls.right).end();

      u.Br(parentDiv);

      ourEls.ingredientTableDiv = u.CreateEl('div').className('tableHolder').style('margin-top:8px').parent(parentDiv).end();

      ourEls.ingredientTable = u.CreateEl('table').className('ingredientTable').id(`${idPrefix}ingredientTable`).parent(ourEls.ingredientTableDiv).end();
      u.Br(parentDiv);

      CreateIngredientTable({
         firstTime: true
      }, idPrefix);

      ourEls.method = u.CreateEl('textarea').className('taclass').placeholder('method').parent(parentDiv).end();
      ourEls.method.rows = '10';

      u.Br(parentDiv);
      ourEls.save_btn = u.CreateEl('button').innerText(mode === 'add' ? 'Add Recipe' : 'Save Changes').parent(parentDiv).end();

      return ourEls;

   }

   /** onclick of 'add recipe' btn, adds recipe based on values in 'add recipe' tab  */
   function AddRecipeBtn(idPrefix) {

      var toCreate = {};

      if (idPrefix == 'editModal_') {
         let theseEls = DATA.els.admin.edit_recipe_modal_els;
         let oldRecipeTitle = DATA.els.admin.edit_recipe_modal.recipeTitle.innerText;
         delete d.recipes[oldRecipeTitle];
         //if name has changed
         if (oldRecipeTitle != theseEls.recipeTitle.value) {
            // go through every menu and change it there if its there
            u.GetKeysExFns(d.menus).forEach(menuTitle => {
               d.menus[menuTitle].meals.forEach(meal => {
                  meal.recipes.forEach(recipe => {
                     if (recipe.recipeTitle === oldRecipeTitle) {
                        recipe.recipeTitle = theseEls.recipeTitle.value;
                     }
                  });
               });
            });
         }
         Object.keys(theseEls).forEach(prop => {
            toCreate[prop] = theseEls[prop].value;
         });
      } else {
         Object.keys(els).forEach(prop => {
            toCreate[prop] = els[prop].value;
         });
         if (toCreate.morv == '_default') {
            toCreate.morv = 'b';
         }
      }

      d.recipes.addRecipe(toCreate);
      let ingredientTable = u.ID(`${idPrefix}ingredientTable`);

      for (let i = 0; i + 2 < ingredientTable.rows.length; i++) {
         let foodName = u.ID(`${idPrefix}selectIngredientFood${i}`).value;
         let quantitySmall = parseFloat(u.ID(`${idPrefix}ingredientQuantitySmall${i}`).value);
         console.log(toCreate);
         console.log(foodName);
         console.log(quantitySmall);
         let morv = u.ID(`${idPrefix}selectIngredientMorv${i}`).value;

         if (morv === "_default" || morv === "null") {
            morv = 'b';
         }
         d.recipes.addIngredient(toCreate.recipeTitle, foodName, quantitySmall, morv);
      }

      for (let i = ingredientTable.rows.length; i > 3; i--) {
         console.log(i);
         ingredientTable.deleteRow(i - 2);
      }
      //clear top row of ingredients table
      u.SetValues([
         [`${idPrefix}selectIngredientFood0`, '_default'],
         [`${idPrefix}ingredientQuantitySmall0`, ''],
         [`${idPrefix}selectIngredientMorv0`, '_default'],
      ]);

      d.write();
      if (idPrefix == 'editModal_') {
         u.ClearVals(DATA.els.admin.edit_recipe_modal_els);
      } else {
         u.ClearVals(els);
      }


      u.ClearVals(els);
   }

   /** creates the ingredient table in the add recipe tab */
   function CreateIngredientTable(firstTimeFlag, idPrefix) {
      //add title row
      u.CreateRow(`${idPrefix}ingredientTable`, "th", ["Food", "Quantity", "", "Morv", "", "", ""], ["", "", "", "", "", "", ""], [280, 100, 80, 100, 15, 15, 15], "px");

      //add 'plus' row
      let plusRow = u.ID(`${idPrefix}ingredientTable`).insertRow();
      // plusRow.className = 'addItemRow';
      let plusCell = u.CreateEl('td').parent(plusRow).className('addItemCell').end();
      let plusButton = u.CreateEl('button').parent(plusCell).className('ingredientTableButton').end();
      u.Icon('plus', plusButton);

      AddIngredientsRow(firstTimeFlag, idPrefix);
      plusButton.addEventListener("click", function() {
         AddIngredientsRow(undefined, idPrefix);
      });
   }
   // tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit, index
   /** creates a row in the ingredients table, icluding the 'remove row' listener */
   function AddIngredientsRow(firstTimeFlag, idPrefix) {
      var ingredientsTable = u.ID(`${idPrefix}ingredientTable`);
      console.log('add ingredients row');
      console.log(firstTimeFlag);
      let j = ingredientsTable.rows.length - 2;

      var rowEls = {};
      //create new rows
      let numberOfRows = ingredientsTable.rows;
      let newRow = ingredientsTable.insertRow(j + 1);

      rowEls.selectFood = u.CreateEl('select').id(`${idPrefix}selectIngredientFood${j}`).style('width:80%').end();
      rowEls.selectQuantity = u.CreateEl('input').type('number').id(`${idPrefix}ingredientQuantitySmall${j}`).style('width:100%').end();
      rowEls.unit = u.CreateEl('span').id(`${idPrefix}ingredientUnitDisplay${j}`).end();
      rowEls.selectMorv = u.CreateEl('select').id(`${idPrefix}selectIngredientMorv${j}`).end();

      rowEls.minus = u.CreateEl('button').id(`${idPrefix}-ingbtn${j}`).className('removeIngredient').end();
      u.Icon('minus', rowEls.minus);

      rowEls.up = u.CreateEl('button').id(`${idPrefix}upbtn${j}`).className('ingredientTableButton').end();
      u.Icon('chevron-up', rowEls.up);

      rowEls.down = u.CreateEl('button').id(`${idPrefix}downbtn${j}`).className('ingredientTableButton').end();
      u.Icon('chevron-down', rowEls.down);

      Object.values(rowEls).forEach(el => {
         let cell = u.CreateEl('td').parent(newRow).className('cellWithInput').end();
         cell.appendChild(el);
      });

      u.ID(`${idPrefix}selectIngredientFood${j}`).addEventListener("change", function() {
         DisplayUnit(j, idPrefix);
      });

      u.ID(`${idPrefix}-ingbtn${j}`).addEventListener("click", DeleteIngredientsRow);
      u.ID(`${idPrefix}upbtn${j}`).addEventListener("click", MoveIngredientsRow);
      u.ID(`${idPrefix}downbtn${j}`).addEventListener("click", MoveIngredientsRow);

      if (firstTimeFlag) {
         if (firstTimeFlag.firstTime) return;
      }

      var update_dropdowns = new CustomEvent('update', {
         detail: {
            global: false,
            table: `${idPrefix}ingredientTable`
         }
      });

      window.dispatchEvent(update_dropdowns);

      return rowEls;

   }
   /** Deletes a given ingredient row */
   function DeleteIngredientsRow() {
      let idPrefix = `${event.target.id.split("_")[0]}_`;
      let i = u.GetNumber(event.target.id) + 1;
      u.ID(`${idPrefix}ingredientTable`).deleteRow(i);
      // renumber the ids of all the rows below the deleted row
      let len = u.ID(`${idPrefix}ingredientTable`).rows.length - 1;
      for (i; i < len; i++) {
         u.ID(`${idPrefix}selectIngredientFood${i}`).id = `${idPrefix}selectIngredientFood${i-1}`;
         u.ID(`${idPrefix}ingredientQuantitySmall${i}`).id = `${idPrefix}ingredientQuantitySmall${i-1}`;
         u.ID(`${idPrefix}ingredientUnitDisplay${i}`).id = `${idPrefix}ingredientUnitDisplay${i-1}`;
         u.ID(`${idPrefix}selectIngredientMorv${i}`).id = `${idPrefix}selectIngredientMorv${i-1}`;
         u.ID(`${idPrefix}-ingbtn${i}`).id = `${idPrefix}-ingbtn${i-1}`;
         u.ID(`${idPrefix}upbtn${i}`).id = `${idPrefix}upbtn${i-1}`;
         u.ID(`${idPrefix}downbtn${i}`).id = `${idPrefix}downbtn${i-1}`;
      }
   }
   /** Displays unit of food[j] in ingredientTable */
   function DisplayUnit(i, idPrefix) {
      if (u.ID(`${idPrefix}selectIngredientFood${i}`).value === "_default") {
         u.ID(`${idPrefix}ingredientUnitDisplay${i}`).innerText = "";
      } else {
         u.ID(`${idPrefix}ingredientUnitDisplay${i}`).innerText = d.foods[u.ID(`${idPrefix}selectIngredientFood${i}`).value].unit;
      }
   }

   /** move an ingredient */
   function MoveIngredientsRow() {
      let ourid = event.target.id.split("_")[1];
      let idPrefix = `${event.target.id.split("_")[0]}_`;
      let i = u.GetNumber(event.target.id);
      let j;
      if (ourid.charAt(0) === "u") {
         j = i - 1;
      } else {
         j = i + 1;
      }
      //check that request is valid
      if (j == -1 || j == u.ID(`${idPrefix}ingredientTable`).rows.length - 2) {
         console.log('invalid request');
         return;
      }
      let rowContents = [u.ID(`${idPrefix}selectIngredientFood${i}`).value, u.ID(`${idPrefix}ingredientQuantitySmall${i}`).value, u.ID(`${idPrefix}selectIngredientMorv${i}`).value];
      u.SetValues([
         [`${idPrefix}selectIngredientFood${i}`, u.ID(`${idPrefix}selectIngredientFood${j}`).value],
         [`${idPrefix}ingredientQuantitySmall${i}`, u.ID(`${idPrefix}ingredientQuantitySmall${j}`).value],
         [`${idPrefix}selectIngredientMorv${i}`, u.ID(`${idPrefix}selectIngredientMorv${j}`).value]
      ]);
      u.SetValues([
         [`${idPrefix}selectIngredientFood${j}`, rowContents[0]],
         [`${idPrefix}ingredientQuantitySmall${j}`, rowContents[1]],
         [`${idPrefix}selectIngredientMorv${j}`, rowContents[2]]
      ]);
      DisplayUnit(i, idPrefix);
      DisplayUnit(j, idPrefix);
   }

   function PopulateValues(recipe, ourEls) {
      //only ever used for the editModal version
      var currentIngLength = u.ID("editModal_ingredientTable").rows.length;
      if (currentIngLength > 3) {
         // clear anything that's already there
         for (let i = currentIngLength; i > 3; i--) {
            console.log('deleting row ' + i);
            u.ID("editModal_ingredientTable").deleteRow(i - 2);
         }
      }

      u.SetValues([
         ['editModal_selectIngredientFood0', '_default'],
         ['editModal_ingredientQuantitySmall0', ''],
         ['editModal_selectIngredientMorv0', '_default'],
      ]);
      u.ClearVals(els);

      //populate normal info
      ['recipeTitle', 'mealType', 'recipeType', 'morv', 'serves', 'method'].forEach(ea => {
         ourEls[ea].value = recipe[ea];
      });

      //populate ingredientsTable
      recipe.ingredients.forEach((ing, i) => {
         if (i > 0) AddIngredientsRow(undefined, 'editModal_');
         u.ID(`editModal_selectIngredientFood${i}`).value = ing.foodName;
         u.ID(`editModal_ingredientQuantitySmall${i}`).value = ing.quantity;
         u.ID(`editModal_selectIngredientMorv${i}`).value = ing.morv;
         DisplayUnit(i, 'editModal_');
      });
   }



   return {
      generator: generator,
      AddRecipeBtn: AddRecipeBtn,
      AddIngredientsRow: AddIngredientsRow,
      PopulateValues: PopulateValues,
      CreatePageEls: CreatePageEls
   };
};