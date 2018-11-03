// TODO: make comments box show specials above it. Make into a proper modal which clears on submit

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);
   const els = DATA.els.edit.editMenu;
   var addMenu = require('./addMenu.js')(DATA);


   var mealTypeFilter, recipeTypeFilter, morvFilter;

   function generator() {

      var tabcontent = u.ID('editMenu_tab_content');
      CreatePageEls(tabcontent);

      DATA.els.edit.selectMenu.addEventListener('change', RefreshEditMenu);

      els.editMealsBtn.addEventListener('click', function() {
         addMenu.RefreshAddMealModal(DATA.els.edit.selectMenu.value);
         DATA.els.create.addMenu.addMealModal.modal.style.display = 'block';
      });

      els.multiplyUpBtn.addEventListener('click', ShowMultiplyUpModal);
      els.multiplyUpModal.save.addEventListener('click', MultiplyUp);

      // u.ID("addRecipeApplyFilters").addEventListener("click", ApplyFilters); // apply filters button in add recipe modal
      // u.ID("addRecipeClearFilters").addEventListener("click", ClearFiltersBtn); // clear filters button in add recipe modal
      // u.ID("addRecipeToMenu_submit").addEventListener("click", AddRecipeToMenu); // add recipes to menu (submit button)
      // u.ID("selectEditMenu").addEventListener("change", RefreshEditMenu); // reload menu when new menuTitle is selected
      //
      // u.ID("addRecipeToMenu_btn").addEventListener("click", function() { // show add recipe modal and refresh contents when button is clicked
      //    RefreshAddRecipeModal();
      //    u.ShowElements("addRecipeToMenu", "block");
      // });
      // u.ID("editMealsEditMenu_btn").addEventListener("click",
      //    function() { // show 'edit meals' modal by calling addMenu code when button is clicked
      //       addMenu.CreateAddMealModal(u.ID("selectEditMenu").value);
      //       u.ShowElements("addMealsToMenu", "block");
      //    });
      // u.ID("addRecipeCancel_btn").addEventListener("click", function() { // hide add recipe modal when cancel button is pressed
      //    u.HideElements('addRecipeToMenu');
      // });
      // u.ID("multiplyUpCancel_btn").addEventListener("click", function() { // hide multiply up modal when cancel button is pressed
      //    u.HideElements("multiplyUp");
      // });
      // u.ID("close_addMeals_modal_btn").addEventListener("click", function() { // hide close meals when cancel button is pressed
      //    u.HideElements("addMealsToMenu");
      // });
      //
      // u.ID("selectRecipeForMenu").addEventListener("change", function() { // auto-select morv for recipes
      //    let recipeName = u.ID("selectRecipeForMenu").value;
      //    if (recipeName === "_default") {
      //       return "no recipe selected";
      //    } else {
      //       u.ID("selectMorvForMenu").value = d.recipes[recipeName].morv;
      //    }
      // });
      //
      // window.addEventListener('update', RefreshPage);
   }

   function CreatePageEls(parentDiv) {
      els.btnDiv = u.CreateEl('div').parent(parentDiv).className('editButtonDiv').end();

      els.multiplyUpBtn = u.CreateEl('button').parent(els.btnDiv).id('multiplyUp_btn').innerText('Multiply Up').end();
      els.editMealsBtn = u.CreateEl('button').parent(els.btnDiv).id('editMealsEditMenu_btn').innerText('Edit Meals').end();

      els.subBox = u.CreateEl('div').parent(parentDiv).end();

      els.menuDiv = u.CreateEl('div').className('editMenu').style('width:430px; float:left').parent(els.subBox).end();
      els.addRecipeDiv = u.CreateEl('div').style('width:300px; margin:0; float:right').parent(els.subBox).end();

      CreateCommentsModal();
      CreateMultiplyUpModal();
      CreateAddRecipeDiv();
   }

   function CreateCommentsModal() {
      let ourEls = u.CreateModalFramework('comments modal', 'Add Comments to', 'recipeTitle')

      ourEls.comments = u.CreateEl('textarea').parent(ourEls.content).className('comments-textarea').end();
      u.Br(ourEls.content);
      ourEls.saveBtn = u.CreateEl('button').parent(ourEls.content).innerText('Save Comments').end();

      els.commentsModal = ourEls;
   }

   function CreateMultiplyUpModal() {
      let ourEls = u.CreateModalFramework('multiply up modal', 'Multiply Up', 'menuTitle')

      ourEls.table = u.CreateEl('table').className('secretTable').parent(ourEls.content).end();
      ourEls.table.insertRow();
      ourEls.table.insertRow();
      u.AddCells(2, ourEls.table.rows[0], 'td');
      u.AddCells(2, ourEls.table.rows[1], 'td');

      ourEls.table.rows[0].cells[0].innerText = 'Meateaters';
      ourEls.table.rows[1].cells[0].innerText = 'Vegetarians';

      ourEls.meateaters = u.CreateEl('input').type('number').parent(ourEls.table.rows[0].cells[1]).end();
      ourEls.vegetarians = u.CreateEl('input').type('number').parent(ourEls.table.rows[1].cells[1]).end();

      u.Br(ourEls.content);
      ourEls.save = u.CreateEl('button').innerText('Save').style('width:150px').parent(ourEls.content).end();

      els.multiplyUpModal = ourEls;
   }

   function CreateAddRecipeDiv() {

      els.filterDiv = u.CreateEl('div').parent(els.addRecipeDiv).end();

      CreateFilterControl();


   }

   function CreateFilterControl() {

      var filterConfig = [{
            enum: 'recipeTypeEnum',
            id: 'recipeType',
            title: 'Recipe Type'
         },
         {
            enum: 'mealTypeEnum',
            id: 'mealType',
            title: 'Meal Type'
         },
         {
            enum: 'morvEnum',
            id: 'morv',
            title: 'Morv'
         }
      ]


   }

   function RefreshPage(EV) {
      if (EV.detail.type === 'config') {
         // call function to create filter checkboxes in the 'add recipe' modal
         mealTypeFilter = CreateFilterList(c.enums.mealTypeEnum, "mealTypeCheckbox", "mealTypeFilters");
         recipeTypeFilter = CreateFilterList(c.enums.recipeTypeEnum, "recipeTypeCheckbox", "recipeTypeFilters");
         morvFilter = CreateFilterList(["b", "v", "m"], "morvCheckbox", "morvFilters");
      }
      if (EV.detail.type === 'dict') {
         //refresh list of recipes
         RefreshEditMenu()
      }
   }

   /** function to create list of checkboxes - returns 'newEnum' which is the list of filter options including 'all'
    * @param {array} sourceEnum the enum which you want to generate the filter list from
    * @param {string} checkboxID the id prefix (followed by a number) you want for each checkbox
    * @param {string} divID the id of the div which these filter boxes are being added to
    */
   function CreateFilterList(sourceEnum, checkboxID, divID) {
      // populate newEnum
      let newEnum = [];
      newEnum[0] = "All";
      for (let i = 0; i < sourceEnum.length; i++) {
         newEnum[i + 1] = sourceEnum[i];
      }
      // create checkboxes
      for (let i = 0; i < newEnum.length; i++) {
         let checklist = u.ID(divID);
         let checkbox = u.CreateElement("input", checklist, `${checkboxID}${i}`);
         let checkboxLabel = u.CreateElement("label", checklist, "", "filterLabel", newEnum[i]);
         checkbox.setAttribute("type", "checkbox");
         checkbox.setAttribute("checked", "true");
         u.CreateElement("br", checklist);
      }
      // check everything on an 'all' box
      u.ID(`${checkboxID}0`).addEventListener("change", function() {
         if (this.checked) {
            for (let i = 1; i < newEnum.length; i++) {
               u.ID(`${checkboxID}${i}`).checked = true;
            }
         } else {
            for (let i = 1; i < newEnum.length; i++) {
               u.ID(`${checkboxID}${i}`).checked = false;
            }
         }
      });
      return newEnum;
   }
   /** function to create an array of all permitted values (as per filters) at a particular point in time
    * @param {array} filterArray Array with all the checkbox names, usually created by the 'CreateFilterList' function
    * @param {string} checkboxID String which prefixes a number which is the ID of each checkbox (id1, id2 etc.)
    */
   function CreateFilterArray(filterArray, checkboxID) {
      let result = [];
      for (let i = 1; i < filterArray.length; i++) {
         if (u.ID(`${checkboxID}${i}`).checked === true) {
            result.push(filterArray[i]);
         }
      }
      return result;
   }
   /** Apply Filters to add recipe modal (so only filtered recipes are shown in the dropdown) */
   function ApplyFilters() {
      // create recipe keys list
      let oldRecipeKeys = Object.keys(d.recipes);
      let filteredRecipeKeys = [];
      let filteredMealTypeArray = CreateFilterArray(mealTypeFilter, "mealTypeCheckbox");
      let filteredRecipeTypeArray = CreateFilterArray(recipeTypeFilter, "recipeTypeCheckbox");
      let filteredMorvArray = CreateFilterArray(morvFilter, "morvCheckbox");

      // check if mealType is correct
      for (let i = 0; i < oldRecipeKeys.length; i++) {
         if (typeof d.recipes[oldRecipeKeys[i]] === "function") {
            continue;
         }
         let mealType = d.recipes[oldRecipeKeys[i]].mealType;
         let recipeType = d.recipes[oldRecipeKeys[i]].recipeType;
         let morv = d.recipes[oldRecipeKeys[i]].morv;

         let filteredMorv = null;
         for (let j = 0; j < morv.length; j++) {
            if (filteredMorvArray.indexOf(morv[j]) > -1) { // check whether morv is present in morv array. If yes, filteredMorv = true
               filteredMorv = true;
            }
         }
         if (
            filteredMealTypeArray.indexOf(mealType) > -1 && // if recipe fulfils all three criteria, add to filteredRecipeKeys
            filteredRecipeTypeArray.indexOf(recipeType) > -1 &&
            filteredMorv === true
         ) {
            filteredRecipeKeys.push(oldRecipeKeys[i]);
         }
      }
      filteredRecipeKeys.sort();
      u.CreateDropdown("selectRecipeForMenu", filteredRecipeKeys, false, undefined, "_default");
   }
   /** Triggered when the 'clear filters' btn is clicked */
   function ClearFiltersBtn() {
      ClearFilters(mealTypeFilter, "mealTypeCheckbox");
      ClearFilters(recipeTypeFilter, "recipeTypeCheckbox");
      ClearFilters(morvFilter, "morvCheckbox");
   }
   /** Clears the Filters for a given filterEnum
    * @param {array} filterEnum this is the enum with the list of options including 'all'
    * @param {string} checkboxID this is the ID of each checkbox (followed by a number)
    */
   function ClearFilters(filterEnum, checkboxID) {
      for (let i = 0; i < filterEnum.length; i++) {
         u.ID(`${checkboxID}${i}`).checked = true;
      }
   }
   /** create select meal dropdown from menu (in edit menu > add recipe) */
   function RefreshAddRecipeModal() {
      // create meal enum & dropdown
      let menuTitle = u.ID('selectEditMenu').value;
      u.ID("addRecipeToMenuTitle").innerText = 'Add Recipe - ' + menuTitle;
      let menu = d.menus[menuTitle];
      let mealEnum = [];
      menu.meals.forEach(meal => {
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         mealEnum.push(`${day} ${meal.mealType}`);
      });
      let values = [];
      for (let i = 0; i < mealEnum.length; i++) {
         values[i] = i;
      }
      u.CreateDropdown("selectMealForMenu", mealEnum, false, values, 'Meal');
   }
   /** Add a recipe to a menu (using data from addRecipeToMenu modal) */
   function AddRecipeToMenu() {
      let menuTitle = u.ID("selectEditMenu").value;
      let mealID = parseInt(u.ID("selectMealForMenu").value);
      let recipeTitle = u.ID("selectRecipeForMenu").value;
      let morv = u.ID("selectMorvForMenu").value;

      d.menus.addRecipe(menuTitle, mealID, recipeTitle, morv);
      d.write();
      RefreshEditMenu();
      u.SetValues([
         ["selectRecipeForMenu", "_default"],
         ["selectMorvForMenu", "_default"]
      ]);
   }

   function ShowMultiplyUpModal() {
      let menuTitle = DATA.els.edit.selectMenu.value
      els.multiplyUpModal.menuTitle = menuTitle;
      els.multiplyUpModal.meateaters.value = d.menus[menuTitle].meateaters;
      els.multiplyUpModal.vegetarians.value = d.menus[menuTitle].vegetarians;
      els.multiplyUpModal.modal.style.display = 'block';
   }
   /** multiply up the menu from inputs in the multiply up modal */
   function MultiplyUp() {
      let menuTitle = DATA.els.edit.selectMenu.value;
      let meateaters = parseInt(els.multiplyUpModal.meateaters.value);
      let vegetarians = parseInt(els.multiplyUpModal.vegetarians.value);

      d.menus.multiplyUp(menuTitle, meateaters, vegetarians);
      d.write();
      els.multiplyUpModal.modal.style.display = 'none';
   }
   /** generates a list of meals and recipes */
   function RefreshEditMenu() {
      console.log('refresh edit menu');
      let menuTitle = DATA.els.edit.selectMenu.value;
      els.menuDiv.innerHTML = "";
      let editBtnIDs = ["multiplyUp_btn", "editMealsEditMenu_btn"];
      if (menuTitle === "_default") { // clears page (i.c.enums. edit buttons) if no menu is selected and ends function
         u.HideElements(editBtnIDs);
         return "menuTitle not selected";
      }
      u.ShowElements(editBtnIDs, "inline"); // dislay the three edit buttons

      let menu = d.menus.getMenu(menuTitle);
      if (!menu) {
         u.ID("selectEditMenu").value = 'Menu';
         u.HideElements(editBtnIDs);
         return "menuTitle not selected";
      }
      for (let i = 0; i < menu.meals.length; i++) {
         // generate and display meal title c.enums.g. Friday Dinner
         let meal = d.menus.getMeal(menuTitle, i);
         let mealTitleBar = u.CreateEl('div').parent(els.menuDiv).className('mealTitleBar').end();
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitle = u.CreateEl("text").parent(mealTitleBar).id(`editMealTitle${i}`).className("mealTitle").style("display:inline-block").innerText(`${day} ${meal.mealType}`).end();

         CreateModifierDiv(mealTitleBar, i, menuTitle);

         // generate and display the mealDiv where the recipes for that meal will go
         let mealDiv = u.CreateElement("div", els.menuDiv, `editMealDiv${i}`);

         meal.recipes.forEach((menuRecipe, j) => {
            let recipe = d.recipes[menuRecipe.recipeTitle];
            let editRecipeTitleDiv = u.CreateElement("div", mealDiv, `editRecipeTitleDiv${i}${j}`, "editMenuRecipe");
            let recipeTitle = u.CreateElement("text", editRecipeTitleDiv, `editRecipeTitle${i}${j}`);
            if (!recipe) {
               recipeTitle.innerText = `Missing Recipe: ${menuRecipe.recipeTitle}`
            } else {

               if (menuRecipe.morv === "b") {
                  recipeTitle.innerText = `${menuRecipe.recipeTitle}`;
               } else {
                  recipeTitle.innerText = `${menuRecipe.recipeTitle} - ${menuRecipe.morv}`;
               }

               //give place to input specials numbers if its a special morv
               if (menuRecipe.morv === 'sp') {
                  console.log('recipe morv is sp');
                  CreateSpecialInput(menuTitle, i, j, mealDiv);
               }

               editRecipeTitleDiv.style.color = c.enums.recipeTypeColours[recipe.recipeType]
            }
            let deleteRecipeFromMenu = u.CreateElement("button", editRecipeTitleDiv, `editDeleteRecipe${i}${j}`, "removeListItem");
            u.Icon('times', deleteRecipeFromMenu);
            deleteRecipeFromMenu.addEventListener("click", function() {
               d.menus.deleteRecipe(menuTitle, i, j);
               d.write();
            });

            let editRecipeComments = u.CreateElement("button", editRecipeTitleDiv, `editRecipeComments${i}${j}`, "removeListItem");
            u.Icon('pen', editRecipeComments);
            editRecipeComments.style = 'margin-right:5px'
            editRecipeComments.addEventListener("click", function() {
               els.commentsModal.recipeTitle.innerText = menuRecipe.recipeTitle;

               var currentComments = d.menus.getRecipe(menuTitle, i, j).comments;
               els.commentsModal.comments.value = currentComments ? currentComments : "";

               els.commentsModal.modal.style.display = 'block';
               els.commentsModal.saveBtn.addEventListener('click', SaveComments);

               function SaveComments(e) {
                  els.commentsModal.modal.style.display = 'none';
                  d.menus.addComments(menuTitle, i, j, els.commentsModal.comments.value);
                  d.write();
                  e.target.removeEventListener('click', SaveComments);
               }
            });

         });
      }
   }

   function CreateModifierDiv(menuDiv, i, menuTitle) {
      var meal = d.menus.getMeal(menuTitle, i);
      var div = u.CreateEl('div').className('modifiers').parent(menuDiv).end();
      var mValue = meal.modifier ? meal.modifier.meateaters : 0;
      var vValue = meal.modifier ? meal.modifier.vegetarians : 0;
      var inputs = {};

      u.CreateEl('text').innerText('M:').className('modifierText').parent(div).end();
      inputs.m = u.CreateEl('input').type('number').className('modifierInput').id(`meateaters${i}`).parent(div).value(mValue).end();
      u.CreateEl('text').innerText('  V:').className('modifierText').parent(div).end();
      inputs.v = u.CreateEl('input').type('number').className('modifierInput').id(`vegetarians${i}`).parent(div).value(vValue).end();

      ['m', 'v'].forEach(ea => {
         inputs[ea].addEventListener('change', function() {
            d.menus.addNumbersModifier(menuTitle, i, u.ID(`meateaters${i}`).value, u.ID(`vegetarians${i}`).value);
            d.write();
         });
      });
   }

   function CreateSpecialInput(menuTitle, mealIndex, recipeIndex, div) {
      console.log('create special input');
      let specialInput = u.CreateEl('input').id(`editSpecialNumbers${mealIndex}}${recipeIndex}`).className('specialCountInput').type('number').parent(div).end();
      let currentValue = d.menus.getRecipe(menuTitle, mealIndex, recipeIndex).specialCount;
      if (currentValue) {
         specialInput.value = currentValue;
      }
      specialInput.addEventListener('change', function() {
         console.log('special has been input!');
         d.menus.getRecipe(menuTitle, mealIndex, recipeIndex).specialCount = parseInt(specialInput.value);
         d.write();
      });
   }

   return {
      generator: generator
   };
}