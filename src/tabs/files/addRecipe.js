module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var e = c.enums;
   var u = require("../../utilities")(DATA);

   function generator() {

      var tabcontent = u.ID('addRecipe_tab_content');
      var els = CreatePageEls(tabcontent, 'add')

      els.save_btn.addEventListener("click", AddRecipeBtn);
      CreateIngredientTable({
         firstTime: true
      });
   }

   // p is the parent div which the content will be added to
   function CreatePageEls(parentDiv, mode) {

      var els = {};
      var titleText = mode === 'add' ? 'Add Recipe' : 'Edit Recipe';
      var btnText = mode === 'add' ? 'Add Recipe' : 'Save Changes';

      els.heading = u.CreateEl('h2').innerText(titleText).parent(parentDiv).end();
      els.recipeTitle = u.CreateEl('input').type('text').placeholder('Recipe Title').parent(parentDiv).end();

      els.subBox = u.CreateEl('div').parent(parentDiv).style('height:70px').end();

      els.left = u.CreateEl('div').style('width:350px; margin:0; float:left').parent(els.subBox).end();
      els.right = u.CreateEl('div').style('width:475px; margin:0; float:right').parent(els.subBox).end();

      u.Br(parentDiv);
      els.mealType = u.CreateEl('select').id('selectRecipeMealType').parent(els.left).end();
      u.Br(els.left);
      els.recipeType = u.CreateEl('select').id('selectRecipeType').parent(els.left).end();

      els.morv = u.CreateEl('select').id('recipeMorv').parent(els.right).end();
      u.Br(els.right);
      els.serves = u.CreateEl('input').type('number').placeholder('serves').parent(els.right).end();

      u.Br(parentDiv);

      els.ingredientTable = u.CreateEl('table').id('ingredientTable').style('margin-top:8px;').parent(parentDiv).end();
      u.Br(parentDiv);
      els.method = u.CreateEl('textarea').className('taclass').placeholder('method').parent(parentDiv).end();
      els.method.rows = '15';

      u.Br(parentDiv);
      els.save_btn = u.CreateEl('button').innerText('Add Recipe').parent(parentDiv).end();


      return els;

   }

   /** onclick of 'add recipe' btn, adds recipe based on values in 'add recipe' tab  */
   function AddRecipeBtn() {
      let title = u.ID("recipeTitle").value;
      let mealType = u.ID("selectRecipeMealType").value;
      let recipeType = u.ID("selectRecipeType").value;
      let serves = parseInt(u.ID("recipeServes").value);
      let method = u.ID("recipeMethod").value;
      let morvInput = u.ID("recipeMorv").value;

      d.recipes.addRecipe(title, mealType, morvInput, serves, method, recipeType);

      for (let i = 0; i + 1 < u.ID("ingredientTable").rows.length; i++) {
         let foodName = u.ID(`selectIngredientFood${i}`).value;
         let quantitySmall = parseFloat(u.ID(`ingredientQuantitySmall${i}`).value);
         if (u.ID(`selectIngredientMorv${i}`).value === "_default" || u.ID(`selectIngredientMorv${i}`).value === "null") {
            d.recipes.addIngredient(title, foodName, quantitySmall, 'b');
         } else {
            let morv = u.ID(`selectIngredientMorv${i}`).value;
            d.recipes.addIngredient(title, foodName, quantitySmall, morv);
         }
         u.ID(`selectIngredientFood${i}`).value = "_default";
         u.ID(`ingredientQuantitySmall${i}`).value = "";
         u.ID(`selectIngredientMorv${i}`).value = "_default";
      }

      for (let i = u.ID("ingredientTable").rows.length; i > 2; i--) {
         u.ID("ingredientTable").deleteRow(i - 1);
      }
      d.write();
      u.SetValues([
         ["recipeTitle", ""],
         ["selectRecipeMealType", "_default"],
         ["selectRecipeType", "_default"],
         ["recipeMorv", "_default"],
         ["recipeServes", ""],
         ["recipeMethod", ""]
      ]);
   }

   /** creates the ingredient table in the add recipe tab */
   function CreateIngredientTable(firstTimeFlag) {
      u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "-", "+", "", ""], ["", "", "", "", "", "addIngRowHeader", "", ""], );
      AddIngredientsRow(firstTimeFlag);
      u.ID("addIngRowHeader").addEventListener("click", AddIngredientsRow);
   }
   // tableID, cellType, cellInnerHtml, cellIDs, cellWidth, widthUnit, index
   /** creates a row in the ingredients table, icluding the 'remove row' listener */
   function AddIngredientsRow(firstTimeFlag) {
      console.log('add ingredients row');
      console.log(firstTimeFlag);
      let j = u.ID("ingredientTable").rows.length - 1;
      let colhtml = [
         `<select id='selectIngredientFood${j}'></select>`,
         `<input type='number' id='ingredientQuantitySmall${j}' style='width:100%'>`,
         "",
         `<select id='selectIngredientMorv${j}'></select>`,
         "-",
         "+",
         "⇧",
         "⇩"
      ];

      u.CreateRow("ingredientTable", "td", colhtml, ["", "", `ingredientUnitDisplay${j}`, "", `-ingbtn${j}`, `+ingbtn${j}`, `upbtn${j}`, `downbtn${j}`], [280, 100, 80, 100, 15, 15, 15, 15], "px", undefined, ["cellWithInput", "cellWithInput", undefined, "cellWithInput"]);

      u.ID(`selectIngredientFood${j}`).addEventListener("change", DisplayUnit);

      u.ID(`+ingbtn${j}`).addEventListener("click", AddIngredientsRow);
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

   }
   /** Deletes a given ingredient row */
   function DeleteIngredientsRow() {
      let i = u.GetNumber(event.target.id) + 1;
      u.ID("ingredientTable").deleteRow(i);
      // renumber the ids of all the rows below the deleted row
      let len = u.ID("ingredientTable").rows.length;
      for (i; i < len; i++) {
         u.ID(`selectIngredientFood${i}`).id = `selectIngredientFood${i-1}`;
         u.ID(`ingredientQuantitySmall${i}`).id = `ingredientQuantitySmall${i-1}`;
         u.ID(`ingredientUnitDisplay${i}`).id = `ingredientUnitDisplay${i-1}`;
         u.ID(`selectIngredientMorv${i}`).id = `selectIngredientMorv${i-1}`;
         u.ID(`-ingbtn${i}`).id = `-ingbtn${i-1}`;
         u.ID(`+ingbtn${i}`).id = `+ingbtn${i-1}`;
      }

   }
   /** Displays unit of food[j] in ingredientTable */
   function DisplayUnit(i) {
      if (typeof i === "object") {
         i = u.GetNumber(event.target.id);
      }
      if (u.ID(`selectIngredientFood${i}`).value === "Food") {
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