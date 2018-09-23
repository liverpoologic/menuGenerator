module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var e = c.enums;
   var u = require("../../utilities")(DATA);

   function generator() {
      u.ID("addRecipe_btn").addEventListener("click", AddRecipeBtn);
      CreateIngredientTable({
         firstTime: true
      });
   }

   /** onclick of 'add recipe' btn, adds recipe based on values in 'add recipe' tab  */
   function AddRecipeBtn() {
      let title = u.ID("recipeTitle").value;
      let mealType = u.ID("selectRecipeMealType").value;
      let recipeType = u.ID("selectRecipeType").value;
      let serves = parseInt(u.ID("recipeServes").value);
      let method = u.ID("recipeMethod").value;
      let morvInput = u.ID("recipeMorv").value;

      if (morvInput === "v / b") {
         d.recipes.addRecipe(title, mealType, ["v", "b"], serves, method, recipeType);
      } else {
         d.recipes.addRecipe(title, mealType, [morvInput], serves, method, recipeType);
      }

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
      u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "-", "+"], ["", "", "", "", "", "addIngRowHeader"], [210, 90, 60, 60, 15, 15], "px");
      AddIngredientsRow(firstTimeFlag);
      u.ID("addIngRowHeader").addEventListener("click", AddIngredientsRow);
   }

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

      u.CreateRow("ingredientTable", "td", colhtml, ["", "", `ingredientUnitDisplay${j}`, "", `-ingbtn${j}`, `+ingbtn${j}`, `upbtn${j}`, `downbtn${j}`], [210, 90, 60, 60, 15, 15, 15, 15], "px");

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
      btn: AddRecipeBtn,
      AddIngredientsRow: AddIngredientsRow
   };
}