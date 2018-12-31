// TODO: make comments box show specials above it. Make into a proper modal which clears on submit

module.exports = function(DATA) {
   var d = DATA.dict;
   var c = DATA.config;
   var s = DATA.state;
   var u = require("../../utilities")(DATA);
   const els = DATA.els.edit.editMenu;
   var addMenu = require('./addMenu.js')(DATA);

   var mealTypeFilter, recipeTypeFilter, morvFilter;

   var filterConfig = [{
         _enum: 'recipeTypeEnum',
         id: 'recipeType',
         title: 'Recipe Type'
      },
      {
         _enum: 'mealTypeEnum',
         id: 'mealType',
         title: 'Meal Type'
      },
      {
         _enum: 'morvEnum',
         id: 'morv',
         title: 'Morv'
      },
      {
         id: 'recipeTitle',
         title: 'Recipe Title'
      }
   ];

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

      window.addEventListener('update', RefreshPage);
   }

   function CreatePageEls(parentDiv) {
      els.btnDiv = u.CreateEl('div').parent(parentDiv).className('showOnVtab editButtonDiv').end();

      els.multiplyUpBtn = u.CreateEl('button').parent(els.btnDiv).id('multiplyUp_btn').innerText('Multiply Up').end();
      els.editMealsBtn = u.CreateEl('button').parent(els.btnDiv).id('editMealsEditMenu_btn').innerText('Edit Meals').end();

      els.subBox = u.CreateEl('div').parent(parentDiv).end();

      els.menuDiv = u.CreateEl('div').className('editMenu').style('width:430px; float:left').parent(els.subBox).end();

      els.addRecipeDiv = u.CreateEl('div').className('showOnVtab').style('width:360px; position:fixed; margin-left: 460px; display:none').parent(els.subBox).end();

      els.morvSelectionModal = u.CreateModalFramework('select morv', 'Adding Recipe', 'recipeTitle')
      els.morvSelectionModal.selectMorv = u.CreateEl('select').id('selectMorvForAddRecipe').parent(els.morvSelectionModal.content).end();
      els.morvSelectionModal.inputSpecialCount = u.CreateEl('input').type('number').parent(els.morvSelectionModal.content).style('display:none; margin-left: 10px').end();
      els.morvSelectionModal.selectMorv.addEventListener('change', function(ev) {
         els.morvSelectionModal.inputSpecialCount.style.display = ev.target.value == 'sp' ? 'inline-block' : 'none';
      });

      u.Br(els.morvSelectionModal.content);
      els.morvSelectionModal.addBtn = u.CreateEl('button').innerText('Add').parent(els.morvSelectionModal.content).end();

      els.morvSelectionModal.addBtn.addEventListener('click', AddRecipeToMenu);

      CreateEditRecipeModal();
      CreateMultiplyUpModal();
      CreateAddRecipeDiv();
   }

   function CreateEditRecipeModal() {
      let ourEls = u.CreateModalFramework('edit recipe modal', 'Edit Recipe', 'recipeTitle')

      ourEls.selectMorv = u.CreateEl('select').id('selectMorvForEditRecipe').parent(ourEls.content).style('display:inline-block').end();
      ourEls.inputSpecialCount = u.CreateEl('input').type('number').parent(ourEls.content).style('display:none; margin-left: 10px').end();
      ourEls.comments = u.CreateEl('textarea').parent(ourEls.content).className('comments-textarea').end();

      ourEls.selectMorv.addEventListener('change', function(ev) {
         ourEls.inputSpecialCount.style.display = ev.target.value == 'sp' ? 'inline-block' : 'none';
      });
      u.Br(ourEls.content);
      ourEls.saveBtn = u.CreateEl('button').parent(ourEls.content).innerText('Save').end();

      els.editRecipeModal = ourEls;
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

      els.recipeDiv = u.CreateEl('div').style('padding:15px 0 0 23px').parent(els.addRecipeDiv).end();


   }

   function CreateFilterControl() {
      els.filters = {};

      filterConfig.forEach(f => {
         els.filters[f.id] = {};
         els.filters[f.id].div = u.CreateEl('div').className('filter-control').parent(els.filterDiv).end();
      });
   }

   function InitialiseRecipeFilterState() {
      s.recipeFilters = {};
      filterConfig.forEach(f => {
         if (f._enum) {
            s.recipeFilters[f.id] = {};
            c.enums[f._enum].forEach(o => {
               s.recipeFilters[f.id][o] = true;
            });
         } else {
            s.recipeFilters[f.id] = '';
         }
      })
   }

   function RefreshFilterControl() {
      //check whether this has happened before
      if (!s.recipeFilters) InitialiseRecipeFilterState();
      console.log('refresh filter control');
      console.log(s.recipeFilters);
      filterConfig.forEach(f => {
         let thisDiv = els.filters[f.id].div;
         thisDiv.innerHTML = "";

         if (f._enum) {
            els.filters[f.id].selectAll = u.CreateEl('button').className('insideCellBtn left').style('margin-top:7px').parent(thisDiv).end();
            u.Icon('check-circle', els.filters[f.id].selectAll);
            els.filters[f.id].selectAll.filter_id = f.id
            els.filters[f.id].selectAll.addEventListener('click', SelectAllFilters)

            let numberOfButtons = c.enums[f._enum].length;
            let buttonWidth = ((325 - (numberOfButtons * 4)) / numberOfButtons).toString();
            c.enums[f._enum].forEach(o => {
               let ourClass = s.recipeFilters[f.id][o] ? 'filter_button selected' : 'filter_button';
               let btn = u.CreateEl('button').innerText(o).className(ourClass).style(`width:${buttonWidth}px`).parent(thisDiv).end();
               btn.filter_id = f.id
               btn.addEventListener('click', SelectFilterBtn);
            });
         } else {
            els.filters[f.id].input = u.CreateEl('input').type('text').placeholder(f.title).style('width:321px; margin: 4px 0 0 22px;').value(s.recipeFilters[f.id]).parent(thisDiv).end();
            els.filters[f.id].input.addEventListener('change', function() {
               s.recipeFilters[f.id] = els.filters[f.id].input.value;
               RefreshRecipes();
            });
         }
         els.filters[f.id].clear = u.CreateEl('button').className('insideCellBtn').style('margin-top:7px').parent(thisDiv).end();
         u.Icon('times', els.filters[f.id].clear);
         els.filters[f.id].clear.filter_id = f.id;
         els.filters[f.id].clear.addEventListener('click', ClearFilters);
      });
   }

   function ClearFilters(e) {
      if (e.target.filter_id === 'recipeTitle') {
         s.recipeFilters[e.target.filter_id] = "";
      } else {
         Object.keys(s.recipeFilters[e.target.filter_id]).forEach(key => {
            s.recipeFilters[e.target.filter_id][key] = false;
         });
      }
      RefreshFilterControl();
      RefreshRecipes();
   }

   function SelectAllFilters(e) {
      Object.keys(s.recipeFilters[e.target.filter_id]).forEach(key => {
         s.recipeFilters[e.target.filter_id][key] = true;
      });
      RefreshFilterControl();
      RefreshRecipes();
   }

   function SelectFilterBtn(e) {
      let notSelected = e.target.className == 'filter_button';
      s.recipeFilters[e.target.filter_id][e.target.innerText] = notSelected;
      e.target.className = notSelected ? 'filter_button selected' : 'filter_button';
      RefreshRecipes();
   }

   function RefreshPage(EV) {
      if (EV.detail.type === 'config') {
         RefreshFilterControl();
      }
      if (EV.detail.type === 'dict') {
         //refresh list of recipes
         RefreshEditMenu();
         RefreshRecipes();
      }
   }

   function RefreshRecipes() {
      console.log('refreshing recipes');
      console.log(d);
      els.recipeDiv.innerHTML = "";
      let maxRecipes = 10;
      let recipesDisplayed = 0;
      //get recipe list
      var recipeList = u.GetKeysExFns(d.recipes).sort();
      let stringFilter = els.filters.recipeTitle.input.value.toLowerCase();
      for (let i = 0; i < recipeList.length; i++) {
         if (recipesDisplayed > maxRecipes) {
            break;
         }
         let recipeTitle = recipeList[i];
         let recipe = d.recipes[recipeTitle];
         let isFiltered = false;
         for (let j = 0; j < filterConfig.length; j++) {
            let f = filterConfig[j];
            if (f._enum) {
               if (!s.recipeFilters[f.id][recipe[f.id]]) {
                  isFiltered = true;
                  //failed filters - this recipe property is 'false'
                  break;
               }
            } else {

               if (stringFilter !== "" && recipeTitle.toLowerCase().indexOf(stringFilter) === -1) {
                  isFiltered = true;
                  //failed filters - this recipe title doesn't match the string
                  break;
               }
            }
         }
         if (!isFiltered) {
            let recipeDiv = u.CreateEl('div').style('width:304px').parent(els.recipeDiv).innerText(recipeTitle).end();

            recipeDiv.className = 'editMenuRecipe drag ' + GetRecipeColorClass(recipe);
            recipeDiv.draggable = true;
            recipeDiv.addEventListener('dragstart', function(ev) {
               ev.dataTransfer.effectAllowed = 'move';
               ev.dataTransfer.setData("recipeTitle", recipeTitle);
               console.log(ev.dataTransfer);
            });
            recipesDisplayed++;
         }
      }
      u.Br(els.recipeDiv);
      let dot_dot_dot = u.Icon('ellipsis-h', els.recipeDiv);
      dot_dot_dot.style.float = 'right';
      dot_dot_dot.style.margin = '4px 20px'
   }

   function GetRecipeColorClass(recipe, menuRecipe) {
      if (menuRecipe && menuRecipe.morv == 'sp') {
         return 'special';
      } else if (recipe.recipeType === 'core') {
         return 'core';
      } else if (recipe.recipeType === 'dessert') {
         return 'dessert';
      } else return 'default'
   }

   function ShowMultiplyUpModal() {
      let menuTitle = DATA.els.edit.selectMenu.value;
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

   function CreateEvListeners(div) {
      div.addEventListener('dragover', function(ev) {
         ev.preventDefault();
         div.style.opacity = 0.6;
      });
      div.addEventListener('dragleave', function(ev) {
         ev.preventDefault();
         div.style.opacity = 1;
      })
      div.addEventListener('drop', function(ev) {
         ev.preventDefault();
         div.style.opacity = 1;
         ShowMorvSelectionModal(ev, div.meal_id);
      });
   }

   function ShowMorvSelectionModal(ev, mealID) {
      els.morvSelectionModal.selectMorv.value = 'b';
      let recipeTitle = ev.dataTransfer.getData("recipeTitle");
      els.morvSelectionModal.recipeTitle.innerText = recipeTitle;
      els.morvSelectionModal.modal.style.display = 'block';
      els.morvSelectionModal.addBtn.meal_id = mealID;
   }

   function AddRecipeToMenu(ev) {
      let mealID = ev.target.meal_id;
      let menuTitle = DATA.els.edit.selectMenu.value;
      let recipeTitle = els.morvSelectionModal.recipeTitle.innerText;
      let specialCount = els.morvSelectionModal.inputSpecialCount.value;
      let morv = els.morvSelectionModal.selectMorv.value;

      d.menus.addRecipe(menuTitle, mealID, recipeTitle, morv, specialCount);
      d.write();

      els.morvSelectionModal.selectMorv.value = 'b';
      els.morvSelectionModal.modal.style.display = 'none';

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
         let overallMealDiv = u.CreateEl('div').parent(els.menuDiv).end();
         overallMealDiv.meal_id = i;
         CreateEvListeners(overallMealDiv);

         let meal = d.menus.getMeal(menuTitle, i);
         let mealTitleBar = u.CreateEl('div').parent(overallMealDiv).className('mealTitleBar').end();
         let day = c.enums.weekday[new Date(meal.date).getDay()];
         let mealTitle = u.CreateEl("text").parent(mealTitleBar).id(`editMealTitle${i}`).className("mealTitle").style("display:inline-block").innerText(`${day} ${meal.mealType}`).end();

         CreateModifierDiv(mealTitleBar, i, menuTitle);

         // generate and display the mealDiv where the recipes for that meal will go
         let mealDiv = u.CreateElement("div", overallMealDiv, `editMealDiv${i}`);

         meal.recipes.forEach((menuRecipe, j) => {
            let recipe = d.recipes[menuRecipe.recipeTitle];
            let editRecipeTitleDiv = u.CreateElement("div", mealDiv, `editRecipeTitleDiv${i}${j}`, "editMenuRecipe " + GetRecipeColorClass(recipe, menuRecipe));
            let recipeTitle = u.CreateElement("text", editRecipeTitleDiv, `editRecipeTitle${i}${j}`);
            if (!recipe) {
               recipeTitle.innerText = `Missing Recipe: ${menuRecipe.recipeTitle}`;
            } else {

               if (menuRecipe.morv === "b") {
                  recipeTitle.innerText = `${menuRecipe.recipeTitle}`;
               } else if (menuRecipe.morv === 'sp' && menuRecipe.specialCount > 0) {

                  recipeTitle.innerText = `${menuRecipe.recipeTitle} - ${menuRecipe.morv}  ${menuRecipe.specialCount}`;
               } else {
                  recipeTitle.innerText = `${menuRecipe.recipeTitle} - ${menuRecipe.morv}`;
               }

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
               els.editRecipeModal.recipeTitle.innerText = menuRecipe.recipeTitle;
               var currentComments = d.menus.getRecipe(menuTitle, i, j).comments;
               els.editRecipeModal.comments.value = currentComments ? currentComments : "";
               els.editRecipeModal.selectMorv.value = menuRecipe.morv;
               if (menuRecipe.morv == 'sp') {
                  els.editRecipeModal.inputSpecialCount.style.display = 'inline-block';
               }
               els.editRecipeModal.inputSpecialCount.value = menuRecipe.specialCount ? menuRecipe.specialCount : 0

               els.editRecipeModal.modal.style.display = 'block';
               els.editRecipeModal.saveBtn.addEventListener('click', SaveEditRecipe);

               function SaveEditRecipe(e) {
                  els.editRecipeModal.modal.style.display = 'none';
                  d.menus.addComments(menuTitle, i, j, els.editRecipeModal.comments.value);
                  d.menus[menuTitle].meals[i].recipes[j].morv = els.editRecipeModal.selectMorv.value;
                  d.menus[menuTitle].meals[i].recipes[j].specialCount = els.editRecipeModal.inputSpecialCount.value;
                  d.write();
                  e.target.removeEventListener('click', SaveEditRecipe);
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

   return {
      generator: generator
   };
}