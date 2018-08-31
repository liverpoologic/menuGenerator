var u = require("../UtilityFunctions.js");
var d = require("../Dicts.js");
var addMenu = require("./addMenu.js");
var Dict = d.Dict;
var Config = d.Config;

var mealTypeFilter, recipeTypeFilter, morvFilter;

module.exports = {
  RefreshEditMenu: RefreshEditMenu, // refresh edit menu screen in response to selected menu
  onLoad:onLoad
};

function onLoad() {
  let e = d.Config.enums;
  u.ID("addRecipeApplyFilters").addEventListener("click", ApplyFilters); // apply filters button in add recipe modal
  u.ID("addRecipeClearFilters").addEventListener("click", ClearFiltersBtn); // clear filters button in add recipe modal
  u.ID("addRecipeToMenu_submit").addEventListener("click", AddRecipeToMenu); // add recipes to menu (submit button)
  u.ID("selectEditMenu").addEventListener("change", RefreshEditMenu); // reload menu when new menuTitle is selected
  u.ID("selectMenuForNewRecipe").addEventListener("change", RefreshAddRecipeModal); // reload add recipe modal with details from new menuTitle
  u.ID("multiplyUp_submit").addEventListener("click", MultiplyUp); // multiply up a given menu when you press the 'submit' button in the multiply up modal

  u.ID("addRecipeToMenu_btn").addEventListener("click", function () { // show add recipe modal and refresh contents when button is clicked
    RefreshAddRecipeModal();
    u.ShowElements("addRecipeToMenu", "block");
  });
  u.ID("multiplyUp_btn").addEventListener("click", function () { // show multiple up modal when button is clicked
    u.ShowElements("multiplyUp", "block");
  });
  u.ID("editMealsEditMenu_btn").addEventListener("click",
  function () { // show 'edit meals' modal by calling addRecipe code when button is clicked
    addMenu.CreateAddMealModal(u.ID("selectEditMenu").value);
    u.ShowElements("addMealsToMenu", "block");
  });
  u.ID("addRecipeCancel_btn").addEventListener("click", function () { // hide add recipe modal when cancel button is pressed
    u.HideElements('addRecipeToMenu');
  });
  u.ID("multiplyUpCancel_btn").addEventListener("click", function () { // hide multiply up modal when cancel button is pressed
    u.HideElements("multiplyUp");
  });
  u.ID("close_addMeals_modal_btn").addEventListener("click", function () { // hide close meals when cancel button is pressed
    u.HideElements("addMealsToMenu");
  });

  u.ID("selectRecipeForMenu").addEventListener("change", function () { // auto-select 'morv=b' for desserts
    let recipeValue = u.ID("selectRecipeForMenu").value;
    if (recipeValue === "Choose Recipe") { return "no recipe selected"; }
    if (Dict.recipes[recipeValue].recipeType === "dessert core") { u.ID("selectMorvForMenu").value = "b"; }
  });

  // call function to create filter checkboxes in the 'add recipe' modal
  mealTypeFilter = CreateFilterList(d.Config.enums.mealTypeEnum, "mealTypeCheckbox", "mealTypeFilters");
  recipeTypeFilter = CreateFilterList(d.Config.enums.recipeTypeEnum, "recipeTypeCheckbox", "recipeTypeFilters");
  morvFilter = CreateFilterList(["b", "v", "m"], "morvCheckbox", "morvFilters");

}

/** function to create list of checkboxes - returns 'newEnum' which is the list of filter options including 'all'
* @param {array} sourceEnum the enum which you want to generate the filter list from
* @param {string} checkboxID the id prefix (followed by a number) you want for each checkbox
* @param {string} divID the id of the div which these filter boxes are being added to
*/
function CreateFilterList(sourceEnum, checkboxID, divID) {
  let e = d.Config.enums;
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
  u.ID(`${checkboxID}0`).addEventListener("change", function () {
    if (this.checked) {
      for (let i = 1; i < newEnum.length; i++) {
        u.ID(`${checkboxID}${i}`).checked = true;
      }
    }
    else {
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
  let e = d.Config.enums;
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
  let e = d.Config.enums;
  // create recipe keys list
  let oldRecipeKeys = Object.keys(Dict.recipes);
  let filteredRecipeKeys = [];
  let filteredMealTypeArray = CreateFilterArray(mealTypeFilter, "mealTypeCheckbox");
  let filteredRecipeTypeArray = CreateFilterArray(recipeTypeFilter, "recipeTypeCheckbox");
  let filteredMorvArray = CreateFilterArray(morvFilter, "morvCheckbox");

  // check if mealType is correct
  for (let i = 0; i < oldRecipeKeys.length; i++) {
    if (typeof Dict.recipes[oldRecipeKeys[i]] === "function") {
      continue;
    }
    let mealType = Dict.recipes[oldRecipeKeys[i]].mealType;
    let recipeType = Dict.recipes[oldRecipeKeys[i]].recipeType;
    let morv = Dict.recipes[oldRecipeKeys[i]].morv;

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
  u.CreateDropdown("selectRecipeForMenu", filteredRecipeKeys, false, undefined, "Choose Recipe");
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
/** Add a recipe to a menu (using data from addRecipeToMenu modal) */
function AddRecipeToMenu() {
  console.log('add recipe to menu');
  let e = d.Config.enums;
  let menuTitle = u.ID("selectMenuForNewRecipe").value;
  let mealID = parseInt(u.ID("selectMealForMenu").value);
  let recipeTitle = u.ID("selectRecipeForMenu").value;
  let morv = u.ID("selectMorvForMenu").value;
  console.log(menuTitle);
  console.log(mealID);
  console.log(recipeTitle);
  console.log(morv);

  Dict.menus.addRecipe(menuTitle, mealID, recipeTitle, morv);
  u.WriteDict(3);
  RefreshEditMenu();
  u.SetValues([["selectMealForMenu", "Choose Meal"], ["selectRecipeForMenu", "Choose Recipe"], ["selectMorvForMenu", "Choose Morv"]]);
}
/** create select meal dropdown from menu (in edit menu > add recipe) */
function RefreshAddRecipeModal() {
  let e = d.Config.enums;
  // create meal enum & dropdon
  let menu = Dict.menus[u.ID("selectMenuForNewRecipe").value];
  let mealEnum = [];
  for (let i = 0; i < menu.meals.length; i++) {
    let day = e.weekday[new Date(menu.meals[i].date).getDay()];
    mealEnum.push(`${day} ${menu.meals[i].mealType}`);
  }
  // creating my own dropdown as needs different displays and values
  let values = [];
  for (let i = 0; i < mealEnum.length; i++) { values[i] = i; }
  u.CreateDropdown("selectMealForMenu", mealEnum, false, values, 'Choose Meal');
}

/** multiply up the menu from inputs in the multiply up modal */
function MultiplyUp() {
  let e = d.Config.enums;
  let menuTitle = u.ID("selectMenuForMultiplyUp").value;
  let meateaters = parseInt(u.ID("multiplyUpMeateaters").value);
  let vegetarians = parseInt(u.ID("multiplyUpVegetarians").value);

  Dict.menus.multiplyUp(menuTitle, meateaters, vegetarians);
  u.WriteDict(3);
  u.SetValues([["selectMenuForMultiplyUp", "Choose Menu"], ["multiplyUpMeateaters", ""], ["multiplyUpVegetarians", ""], ["selectEditMenu", menuTitle]]);
  u.HideElements("multiplyUp");
}
/** generates a list of meals and recipes */
function RefreshEditMenu() {
  console.log('refresh edit menu');
  let e = d.Config.enums;
  let menuTitle = u.ID("selectEditMenu").value;
  let menuDiv = u.ID("editMenuDiv");
  menuDiv.innerHTML = "";
  let editBtnIDs = ["addRecipeToMenu_btn", "multiplyUp_btn", "editMealsEditMenu_btn"];
  if (menuTitle === "Menu") { // clears page (i.e. edit buttons) if no menu is selected and ends function
    u.HideElements(editBtnIDs);
    return "menuTitle not selected";
  }
  u.ShowElements(editBtnIDs, "inline"); // dislay the three edit buttons
  u.SetValues([["selectMenuForMultiplyUp", menuTitle], ["selectMenuForNewRecipe", menuTitle]]); // set menu titles in add recipe modal and multiply up modal

  let menu = Dict.menus.getMenu(menuTitle);
  if(!menu){
    u.ID("selectEditMenu").value = 'Menu';
    u.HideElements(editBtnIDs);
    return "menuTitle not selected";
  }
  for (let i = 0; i < menu.meals.length; i++) {
    // generate and display meal title e.g. Friday Dinner
    let meal = Dict.menus.getMeal(menuTitle, i);
    let mealTitleBar = u.CreateEl('div').parent(menuDiv).className('mealTitleBar').end();
    let day = e.weekday[new Date(meal.date).getDay()];
    let mealTitle = u.CreateEl("text").parent(mealTitleBar).id(`editMealTitle${i}`).className( "mealTitle").style("display:inline-block").innerText(`${day} ${meal.mealType}`).end();

    // u.Html(mealTitle, `editMealTitle${i}`, "mealTitle", "display:inline-block", "", `${day} ${meal.mealType}`);
    CreateModifierDiv(mealTitleBar,i,menuTitle);

    // generate and display the mealDiv where the recipes for that meal will go
    let mealDiv = u.CreateElement("div", menuDiv, `editMealDiv${i}`);

    meal.recipes.forEach((menuRecipe,j) => {
      let recipe = Dict.recipes[menuRecipe.recipeTitle];
      let editRecipeTitleDiv = u.CreateElement("div", mealDiv, `editRecipeTitleDiv${i}${j}`, "listItem");
      let recipeTitle = u.CreateElement("text", editRecipeTitleDiv, `editRecipeTitle${i}${j}`, "recipeTitle");
      if (recipe === null) { return; }

      if (menuRecipe.morv === "b") { recipeTitle.innerText = `${menuRecipe.recipeTitle}`; }
      else { recipeTitle.innerText = `${menuRecipe.recipeTitle} - ${menuRecipe.morv}`; }

      //give place to input specials numbers if its a special morv
      if(menuRecipe.morv === 'sp'){
        console.log('recipe morv is sp')
        CreateSpecialInput(menuTitle,i,j,mealDiv)
      }

//TODO make this so that the event listener is edited / changed / removed - currently is broken
      recipeTitle.addEventListener('click',function(){
        u.ID('editRecipeInMenu').style.display='block';
        u.ID('save_comments').addEventListener('click',SaveComments);
        function SaveComments(){
          Dict.menus.addComments(menuTitle,i,j,u.ID('add_comments').value);
          u.WriteDict(3);
          u.ID('editRecipeInMenu').style.display='none';
          u.ID('add_comments').value = "";
          u.ID('save_comments').removeEventListener('click',SaveComments);
        };
      });

      // ["core","veg","starch","sauce","other","dessert c","dessert other"]
      let recipeColors = ["#264D9B", "#5E81C5", "#85A2DC", "#B5C9F0", "#CCCCCC", "#23D08A", "#71E6B7"];
      for (let i = 0; i < e.recipeTypeEnum.length; i++) {
        if (recipe.recipeType === e.recipeTypeEnum[i] && menuRecipe.morv != 'sp') { editRecipeTitleDiv.style.backgroundColor = recipeColors[i]; break; }
      }
      if (recipe.recipeType === "core") { editRecipeTitleDiv.style.color = "white"; }

      let deleteRecipeFromMenu = u.CreateElement("button", editRecipeTitleDiv, `editDeleteRecipe${i}${j}`, "removeRecipe", "x");
      deleteRecipeFromMenu.addEventListener("click", function () {
        Dict.menus.deleteRecipe(menuTitle, i, j);
        u.WriteDict(3);
      });
    });
  }
}

function CreateModifierDiv(menuDiv,i,menuTitle){
  let e = d.Config.enums;
  var meal = Dict.menus.getMeal(menuTitle,i);
  var div = u.CreateEl('div').className('modifiers').parent(menuDiv).end();
  var mValue = meal.modifier ? meal.modifier.meateaters : 0;
  var vValue = meal.modifier ? meal.modifier.vegetarians : 0;
  var inputs = {};

  u.CreateEl('text').innerText('M:').className('modifierText').parent(div).end();
  inputs.m = u.CreateEl('input').type('number').className('modifierInput').id(`meateaters${i}`).parent(div).value(mValue).end();
  u.CreateEl('text').innerText('  V:').className('modifierText').parent(div).end();
  inputs.v = u.CreateEl('input').type('number').className('modifierInput').id(`vegetarians${i}`).parent(div).value(vValue).end();

  ['m','v'].forEach(ea => {
    inputs[ea].addEventListener('change',function(){
      Dict.menus.addNumbersModifier(menuTitle,i,u.ID(`meateaters${i}`).value,u.ID(`vegetarians${i}`).value);
      u.WriteDict(3);
    });
  });
}

function CreateSpecialInput(menuTitle,mealIndex,recipeIndex,div){
  console.log('create special input');
  let specialInput = u.CreateEl('input').id(`editSpecialNumbers${mealIndex}}${recipeIndex}`).className('specialCountInput').type('number').parent(div).end();
  let currentValue = Dict.menus.getRecipe(menuTitle,mealIndex,recipeIndex).specialCount;
  if(currentValue){
    specialInput.value = currentValue;
  }
  specialInput.addEventListener('change',function(){
    console.log('special has been input!')
    Dict.menus.getRecipe(menuTitle,mealIndex,recipeIndex).specialCount = parseInt(specialInput.value);
    u.WriteDict(3);
  });
}
