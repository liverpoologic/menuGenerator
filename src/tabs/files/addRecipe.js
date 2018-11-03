module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var e = c.enums;
   var u = require("../../utilities")(DATA);
   const els = DATA.els.create.addRecipe;

   function generator() {

      var tabcontent = u.ID('addRecipe_tab_content');
      CreatePageEls(tabcontent, 'add')

      els.save_btn.addEventListener("click", function() {
         AddRecipeBtn(els)
      });

      CreateIngredientTable({
         firstTime: true
      });
   }

   // p is the parent div which the content will be added to
   function CreatePageEls(parentDiv, mode) {
      var titleText = mode === 'add' ? 'Add Recipe' : 'Edit Recipe';
      var btnText = mode === 'add' ? 'Add Recipe' : 'Save Changes';

      els.recipeTitle = u.CreateEl('input').type('text').placeholder('Recipe Title').parent(parentDiv).end();

      els.subBox = u.CreateEl('div').parent(parentDiv).style('height:70px').end();

      els.left = u.CreateEl('div').style('width:340px; margin:0; float:left').parent(els.subBox).end();
      els.right = u.CreateEl('div').style('width:465px; margin:0; float:right').parent(els.subBox).end();

      u.Br(parentDiv);
      els.mealType = u.CreateEl('select').id('selectRecipeMealType').parent(els.left).end();
      u.Br(els.left);
      els.recipeType = u.CreateEl('select').id('selectRecipeType').parent(els.left).end();

      els.morv = u.CreateEl('select').id('recipeMorv').parent(els.right).end();
      u.Br(els.right);
      els.serves = u.CreateEl('input').type('number').placeholder('serves').parent(els.right).end();

      u.Br(parentDiv);

      els.ingredientTableDiv = u.CreateEl('div').className('tableHolder').style('margin-top:8px').parent(parentDiv).end();

      els.ingredientTable = u.CreateEl('table').className('ingredientTable').id('ingredientTable').parent(els.ingredientTableDiv).end();
      u.Br(parentDiv);
      els.method = u.CreateEl('textarea').className('taclass').placeholder('method').parent(parentDiv).end();
      els.method.rows = '15';

      u.Br(parentDiv);
      els.save_btn = u.CreateEl('button').innerText('Add Recipe').parent(parentDiv).end();

      return els;

   }

   /** onclick of 'add recipe' btn, adds recipe based on values in 'add recipe' tab  */
   function AddRecipeBtn(els) {
      var toCreate = {};
      Object.keys(els).forEach(prop => {
         toCreate[prop] = els[prop].value;
      });

      d.recipes.addRecipe(toCreate);

      for (let i = 0; i + 1 < u.ID("ingredientTable").rows.length; i++) {
         let foodName = u.ID(`selectIngredientFood${i}`).value;
         let quantitySmall = parseFloat(u.ID(`ingredientQuantitySmall${i}`).value);
         if (u.ID(`selectIngredientMorv${i}`).value === "_default" || u.ID(`selectIngredientMorv${i}`).value === "null") {
            d.recipes.addIngredient(toCreate.recipeTitle, foodName, quantitySmall, 'b');
         } else {
            let morv = u.ID(`selectIngredientMorv${i}`).value;
            d.recipes.addIngredient(toCreate.recipeTitle, foodName, quantitySmall, morv);
         }
      }

      for (let i = u.ID("ingredientTable").rows.length; i > 2; i--) {
         u.ID("ingredientTable").deleteRow(i - 1);
      }
      //clear top row of ingredients table
      u.SetValues([
         ['selectIngredientFood0', '_default'],
         ['ingredientQuantitySmall0', ''],
         ['selectIngredientMorv0', '_default'],

      ]);

      d.write();
      u.ClearVals(els);
   }

   /** creates the ingredient table in the add recipe tab */
   function CreateIngredientTable(firstTimeFlag) {
      //add title row
      u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "", "", ""], ["", "", "", "", "", "", ""], [280, 100, 80, 100, 15, 15, 15], "px");

      //add 'plus' row
      let plusRow = u.ID('ingredientTable').insertRow();
      // plusRow.className = 'addItemRow';
      let plusCell = u.CreateEl('td').parent(plusRow).className('addItemCell').end();
      let plusButton = u.CreateEl('button').parent(plusCell).className('ingredientTableButton').end();
      u.Icon('plus', plusButton)

      AddIngredientsRow(firstTimeFlag);
      plusButton.addEventListener("click", AddIngredientsRow);
   }
   // tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit, index
   /** creates a row in the ingredients table, icluding the 'remove row' listener */
   function AddIngredientsRow(firstTimeFlag) {
      var ingredientsTable = u.ID('ingredientTable');
      console.log('add ingredients row');
      console.log(firstTimeFlag);
      let j = ingredientsTable.rows.length - 2;

      var rowEls = {}
      //create new rows
      let numberOfRows = ingredientsTable.rows;
      let newRow = ingredientsTable.insertRow(j + 1);

      rowEls.selectFood = u.CreateEl('select').id(`selectIngredientFood${j}`).style('width:80%').end();
      rowEls.selectQuantity = u.CreateEl('input').type('number').id(`ingredientQuantitySmall${j}`).style('width:100%').end();
      rowEls.unit = u.CreateEl('span').id(`ingredientUnitDisplay${j}`).end();
      rowEls.selectMorv = u.CreateEl('select').id(`selectIngredientMorv${j}`).end();

      rowEls.minus = u.CreateEl('button').id(`-ingbtn${j}`).className('removeIngredient').end();
      u.Icon('minus', rowEls.minus);

      rowEls.up = u.CreateEl('button').id(`upbtn${j}`).className('ingredientTableButton').end();
      u.Icon('chevron-up', rowEls.up);

      rowEls.down = u.CreateEl('button').id(`downbtn${j}`).className('ingredientTableButton').end();
      u.Icon('chevron-down', rowEls.down);

      Object.values(rowEls).forEach(el => {
         let cell = u.CreateEl('td').parent(newRow).className('cellWithInput').end();
         cell.appendChild(el);
      })

      u.ID(`selectIngredientFood${j}`).addEventListener("change", DisplayUnit);

      u.ID(`-ingbtn${j}`).addEventListener("click", DeleteIngredientsRow);
      u.ID(`upbtn${j}`).addEventListener("click", MoveIngredientsRow);
      u.ID(`downbtn${j}`).addEventListener("click", MoveIngredientsRow);

      if (firstTimeFlag) {
         if (firstTimeFlag.firstTime) return;
      }

      var update_dropdowns = new CustomEvent('update', {
         detail: {
            global: false,
            table: 'ingredientTable'
         }
      });

      window.dispatchEvent(update_dropdowns);

      return rowEls;

   }
   /** Deletes a given ingredient row */
   function DeleteIngredientsRow() {
      let i = u.GetNumber(event.target.id) + 1;
      u.ID("ingredientTable").deleteRow(i);
      // renumber the ids of all the rows below the deleted row
      let len = u.ID("ingredientTable").rows.length - 1;
      for (i; i < len; i++) {
         u.ID(`selectIngredientFood${i}`).id = `selectIngredientFood${i-1}`;
         u.ID(`ingredientQuantitySmall${i}`).id = `ingredientQuantitySmall${i-1}`;
         u.ID(`ingredientUnitDisplay${i}`).id = `ingredientUnitDisplay${i-1}`;
         u.ID(`selectIngredientMorv${i}`).id = `selectIngredientMorv${i-1}`;
         u.ID(`-ingbtn${i}`).id = `-ingbtn${i-1}`;
         u.ID(`upbtn${i}`).id = `upbtn${i-1}`;
         u.ID(`downbtn${i}`).id = `downbtn${i-1}`;
      }
   }
   /** Displays unit of food[j] in ingredientTable */
   function DisplayUnit(i) {
      if (typeof i === "object") {
         i = u.GetNumber(event.target.id);
      }
      if (u.ID(`selectIngredientFood${i}`).value === "_default") {
         u.ID(`ingredientUnitDisplay${i}`).innerText = "";
      } else {
         u.ID(`ingredientUnitDisplay${i}`).innerText = d.foods[u.ID(`selectIngredientFood${i}`).value].unit;
      }
   }

   /** move an ingredient */
   function MoveIngredientsRow() {
      let i = u.GetNumber(event.target.id);
      let j;
      if (event.target.id.charAt(0) === "u") {
         j = i - 1;
      } else {
         j = i + 1;
      }
      //check that request is valid
      if (j == -1 || j == u.ID('ingredientTable').rows.length - 2) {
         return;
      }
      let rowContents = [u.ID(`selectIngredientFood${i}`).value, u.ID(`ingredientQuantitySmall${i}`).value, u.ID(`selectIngredientMorv${i}`).value];
      u.SetValues([
         [`selectIngredientFood${i}`, u.ID(`selectIngredientFood${j}`).value],
         [`ingredientQuantitySmall${i}`, u.ID(`ingredientQuantitySmall${j}`).value],
         [`selectIngredientMorv${i}`, u.ID(`selectIngredientMorv${j}`).value]
      ]);
      u.SetValues([
         [`selectIngredientFood${j}`, rowContents[0]],
         [`ingredientQuantitySmall${j}`, rowContents[1]],
         [`selectIngredientMorv${j}`, rowContents[2]]
      ]);
      DisplayUnit(i);
      DisplayUnit(j);
   }

   return {
      generator: generator,
      AddRecipeBtn: AddRecipeBtn,
      AddIngredientsRow: AddIngredientsRow
   };
}