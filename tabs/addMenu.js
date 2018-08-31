var u = require("../UtilityFunctions.js");
var d = require("../Dicts.js");
var Dict = d.Dict;
var Config = d.Config;

function onLoad() {
    u.ID("addmenu_btn").addEventListener("click", AddMenuBtn);
    u.ID("add_weekend_menu").addEventListener("click", AddWeekendMenuBtn);
    u.ID("addMeals_btn").addEventListener("click", AddMealBtn);
}

function AddMenuBtn() { //when you press 'add empty menu' button on the add menu screen
    let e = d.Config.enums;
    let title = u.ID("newMenuTitle").value;
    let startDate = new Date(u.ID("menuStartDate").value);
    let endDate = new Date(u.ID("menuEndDate").value);
    Dict.menus.addMenu(title, startDate, endDate);
    u.WriteDict(3);
    CreateAddMealModal(title);
    u.SetValues([["newMenuTitle", ""], ["menuEndDate", ""], ["menuStartDate", ""]]);
}
function AddWeekendMenuBtn() { //when you press 'add weekend menu' button on the add menu screen
let e = d.Config.enums;
    let title = u.ID("newMenuTitle").value;
    let startDate = new Date(u.ID("menuStartDate").value);
    let endDate = new Date(u.ID("menuEndDate").value);
    let midDate = new Date(u.ID("menuStartDate").value);
    midDate.setDate(startDate.getDate() + 1);

    Dict.menus.addMenu(title, startDate, endDate);

    try{
        Dict.menus.addMeal(title, "dinner", startDate);
        Dict.menus.addMeal(title, "breakfast", midDate);
        Dict.menus.addMeal(title, "snack", midDate);
        Dict.menus.addMeal(title, "lunch", midDate);
        Dict.menus.addMeal(title, "dinner", midDate);
        Dict.menus.addMeal(title, "breakfast", endDate);
        Dict.menus.addMeal(title, "lunch", endDate);

        Dict.menus.addRecipe(title, 1, "Standard Breakfast", "b");
        Dict.menus.addRecipe(title, 5, "Standard Breakfast", "b");
    }
    catch(e){
        console.log(e);
    }

    u.SetValues([["newMenuTitle", ""], ["menuEndDate", ""], ["menuStartDate", ""]]);
    u.WriteDict(3);
}
function CreateAddMealModal(menuTitle) { // creates and shows the modal 'add meal', calls 'CreateMealList' to make the right hand panel
let e = d.Config.enums;

    let startDate = new Date(Dict.menus[menuTitle].startDate);
    let endDate = new Date(Dict.menus[menuTitle].endDate);
    if (endDate < startDate) { console.log("End Date is after Start Date"); return null; }
    u.ID("menuTitleForAddMeals").innerHTML = menuTitle;
    // create list of dates
    let dateList = [];
    let end = false;
    let i = 0;
    while (end === false) {
        dateList[i] = new Date(Dict.menus[menuTitle].startDate);
        dateList[i].setDate(startDate.getDate() + i);
        if (dateList[i].getDate() === endDate.getDate()) { end = true; }
        if (i === 20) { end = true; console.log("date range too large"); }
        i++;
    }
    let dateEnum = [];
    for (let j = 0; j < dateList.length; j++) {
        let x = dateList[j];
        dateEnum[j] = `${e.weekday[x.getDay()]} (${u.GetFormalDate(x)})`;
    }
    u.CreateDropdown("selectDayForAddMeals", dateEnum, false, dateList,'Select Day');
    CreateMealList();
    u.ID("addMealsToMenu").style = "display: block";
}
function CreateMealList() { // creates the meal list on the right of the add meal modal, and adds delete buttons that remove a meal and reload the list
  let e = d.Config.enums;
    let menuTitle = u.ID("menuTitleForAddMeals").innerHTML;
    u.SetValues([["selectMealTypeForAddMeals", "Select Meal"]]);
    let mealDiv = u.ID("currentMealList");
    mealDiv.innerHTML = "";
    let menu = Dict.menus[menuTitle];
    for (let i = 0; i < menu.meals.length; i++) {
        let meal = Dict.menus.getMeal(menuTitle, i);
        let day = e.weekday[new Date(meal.date).getDay()];
        let mealTitleDiv = u.CreateElement("div", mealDiv, "", "listItem");
        mealTitleDiv.style.width='300px';
        let mealTitle = u.CreateElement("text", mealTitleDiv, "", "recipeTitle", `${day} ${meal.mealType}`);

        let deleteMealFromMenu = u.CreateElement("button", mealTitleDiv, "", "removeRecipe", "x");
        deleteMealFromMenu.addEventListener("click", function () {
            Dict.menus.deleteMeal(menuTitle, i);
            u.WriteDict(3);
            CreateMealList();
        });
    }
}
function AddMealBtn() {// adds event listener for the 'add meal' button in the add meal modal
    let menuTitle = u.ID("menuTitleForAddMeals").innerHTML;
    let mealID = Dict.menus.addMeal(menuTitle, u.ID("selectMealTypeForAddMeals").value, new Date(u.ID("selectDayForAddMeals").value));
    if (u.ID("selectMealTypeForAddMeals").value === "breakfast") {
        Dict.menus.addRecipe(menuTitle, mealID, "Standard Breakfast", "b");
    }
    u.WriteDict(3);
    CreateMealList();
}

module.exports = {
    AddMeal: AddMealBtn, // add meal to menu
    CreateAddMealModal: CreateAddMealModal, // create (and show) the add meal modal
    onLoad: onLoad
};
