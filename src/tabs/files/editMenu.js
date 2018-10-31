// TODO: make comments box show specials above it. Make into a proper modal which clears on submit

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config
   var u = require("../../utilities")(DATA);
   var addMenu = require('./addMenu.js')(DATA);


   var mealTypeFilter, recipeTypeFilter, morvFilter, ELS;

   function generator(hTabEls) {

      var tabcontent = u.ID('editMenu_tab_content');
      ELS = CreatePageEls(tabcontent);
      ELS.selectMenu = hTabEls.selectMenu;
      ELS.printMenu = hTabEls.printMenu;

      ELS.selectMenu.addEventListener('change', RefreshEditMenu);

      // u.ID("addRecipeApplyFilters").addEventListener("click", ApplyFilters); // apply filters button in add recipe modal
      // u.ID("addRecipeClearFilters").addEventListener("click", ClearFiltersBtn); // clear filters button in add recipe modal
      // u.ID("addRecipeToMenu_submit").addEventListener("click", AddRecipeToMenu); // add recipes to menu (submit button)
      // u.ID("selectEditMenu").addEventListener("change", RefreshEditMenu); // reload menu when new menuTitle is selected
      // u.ID("multiplyUp_submit").addEventListener("click", MultiplyUp); // multiply up a given menu when you press the 'submit' button in the multiply up modal
      //
      // u.ID("addRecipeToMenu_btn").addEventListener("click", function() { // show add recipe modal and refresh contents when button is clicked
      //    RefreshAddRecipeModal();
      //    u.ShowElements("addRecipeToMenu", "block");
      // });
      // u.ID("multiplyUp_btn").addEventListener("click", function() { // show multiple up modal when button is clicked
      //    u.ShowElements("multiplyUp", "block");
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
      let els = {};

      els.btnDiv = u.CreateEl('div').parent(parentDiv).className('editButtonDiv').end();

      els.addRecipeBtn = u.CreateEl('button').parent(els.btnDiv).id('addRecipeToMenu_btn').innerText('Add Recipe').end();
      els.addRecipeBtn = u.CreateEl('button').parent(els.btnDiv).id('multiplyUp_btn').innerText('Multiply Up').end();
      els.addRecipeBtn = u.CreateEl('button').parent(els.btnDiv).id('editMealsEditMenu_btn').innerText('Edit Meals').end();

      els.menuDiv = u.CreateEl('div').className('editMenu').parent(parentDiv).end();

      els.commentsModal = CreateCommentsModal();

      return els;
   }

   function CreateCommentsModal() {
      let els = {};
      els.modal = u.CreateEl('div').id('Comments Modal').className('modal').parent(u.ID('modals')).end();
      els.modalContent = u.CreateEl('div').className('modal-content animate').parent(els.modal).end();
      els.titleContainer = u.CreateEl('div').className('container').style('padding-bottom:0px').parent(els.modalContent).end();
      els.title = u.CreateEl('text').className('modal-title').innerText('Add Comments to: ').parent(els.titleContainer).end();
      els.menuTitle = u.CreateEl('text').className('modal-title').parent(els.titleContainer).end();
      els.content = u.CreateEl('div').className('container').parent(els.modalContent).end();
      els.comments = u.CreateEl('textarea').parent(els.content).className('comments-textarea').end();
      u.Br(els.content);
      els.saveBtn = u.CreateEl('button').parent(els.content).innerText('Save Comments').end();

      return els;
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

   function RefreshAllModals() {
      //    RefreshAddRecipeModal();
      //  RefreshMultiplyUpModal();
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

   function RefreshMultiplyUpModal() {
      //populate meateaters and vegetarians
      let menuTitle = u.ID('selectEditMenu').value;
      if (menuTitle === '_default') {
         return;
      }
      u.ID("multiplyUpTitle").innerText = 'Multiply Up - ' + menuTitle;

      u.SetValues([
         ['multiplyUpMeateaters', d.menus[menuTitle].meateaters],
         ['multiplyUpVegetarians', d.menus[menuTitle].vegetarians]
      ]);
   }
   /** multiply up the menu from inputs in the multiply up modal */
   function MultiplyUp() {
      let menuTitle = u.ID("selectEditMenu").value;
      let meateaters = parseInt(u.ID("multiplyUpMeateaters").value);
      let vegetarians = parseInt(u.ID("multiplyUpVegetarians").value);

      d.menus.multiplyUp(menuTitle, meateaters, vegetarians);
      d.write();
      u.HideElements("multiplyUp");
   }
   /** generates a list of meals and recipes */
   function RefreshEditMenu() {
      console.log('refresh edit menu');
      let menuTitle = ELS.selectMenu.value;
      ELS.menuDiv.innerHTML = "";
      let editBtnIDs = ["addRecipeToMenu_btn", "multiplyUp_btn", "editMealsEditMenu_btn"];
      if (menuTitle === "_default") { // clears page (i.c.enums. edit buttons) if no menu is selected and ends function
         u.HideElements(editBtnIDs);
         return "menuTitle not selected";
      }
      u.ShowElements(editBtnIDs, "inline"); // dislay the three edit buttons
      RefreshAllModals();

      let menu = d.menus.getMenu(menuTitle);
      if (!menu) {
         u.ID("selectEditMenu").value = 'Menu';
         u.HideElements(editBtnIDs);
         return "menuTitle not selected";
      }
      for (let i = 0; i < menu.meals.length; i++) {
         // generate and display meal title c.enums.g. Friday Dinner
         let meal = d.menus.getMeal(menuTitle, i);
         let mealTitleBar = u.CreateEl('div').parent(ELS.menuDiv).className('mealTitleBar').end();
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitle = u.CreateEl("text").parent(mealTitleBar).id(`editMealTitle${i}`).className("mealTitle").style("display:inline-block").innerText(`${day} ${meal.mealType}`).end();

         CreateModifierDiv(mealTitleBar, i, menuTitle);

         // generate and display the mealDiv where the recipes for that meal will go
         let mealDiv = u.CreateElement("div", ELS.menuDiv, `editMealDiv${i}`);

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
               ELS.commentsModal.menuTitle.innerText = menuRecipe.recipeTitle;

               var currentComments = d.menus.getRecipe(menuTitle, i, j).comments;
               ELS.commentsModal.comments.value = currentComments ? currentComments : "";

               ELS.commentsModal.modal.style.display = 'block';
               ELS.commentsModal.saveBtn.addEventListener('click', SaveComments);

               function SaveComments(e) {
                  ELS.commentsModal.modal.style.display = 'none';
                  d.menus.addComments(menuTitle, i, j, ELS.commentsModal.comments.value);
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