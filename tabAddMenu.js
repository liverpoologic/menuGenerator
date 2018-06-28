var u = require("./UtilityFunctions.js")
var d = require("./Dicts.js")
var Dict = d.Dict
var e = Dict[4]

function onLoad() {
    u.ID("addmenu_btn").addEventListener("click", AddMenuBtn)
    u.ID("add_weekend_menu").addEventListener("click", AddWeekendMenuBtn)
    u.ID("addMeals_btn").addEventListener("click", AddMealBtn)
}

function AddMenuBtn() { //when you press 'add empty menu' button on the add menu screen
    let title = u.ID("menuTitle").value
    let startDate = new Date(u.ID("menuStartDate").value)
    let endDate = new Date(u.ID("menuEndDate").value)
    Dict[3].addMenu(title, startDate, endDate)
    u.WriteDict(3)
    CreateAddMealModal(title)
    u.SetValues([["menuTitle", ""], ["menuEndDate", ""], ["menuStartDate", ""]])
}
function AddWeekendMenuBtn() { //when you press 'add weekend menu' button on the add menu screen
    let title = u.ID("menuTitle").value
    let startDate = new Date(u.ID("menuStartDate").value)
    let endDate = new Date(u.ID("menuEndDate").value)
    let midDate = new Date(u.ID("menuStartDate").value);
    midDate.setDate(startDate.getDate() + 1);

    Dict[3].addMenu(title, startDate, endDate)

    Dict[3].addMeal(title, "dinner", startDate)
    Dict[3].addMeal(title, "breakfast", midDate)
    Dict[3].addMeal(title, "snack", midDate)
    Dict[3].addMeal(title, "lunch", midDate)
    Dict[3].addMeal(title, "dinner", midDate)
    Dict[3].addMeal(title, "breakfast", endDate)
    Dict[3].addMeal(title, "lunch", endDate)

    Dict[3].addRecipe(title, 1, "Standard Breakfast", "b")
    Dict[3].addRecipe(title, 5, "Standard Breakfast", "b")

    u.WriteDict(3)
    u.SetValues([["menuTitle", ""], ["menuEndDate", ""], ["menuStartDate", ""]])
}
function CreateAddMealModal(menuTitle) { // creates and shows the modal 'add meal', calls 'CreateMealList' to make the right hand panel
    let startDate = new Date(Dict[3][menuTitle].startDate)
    let endDate = new Date(Dict[3][menuTitle].endDate)
    if (endDate < startDate) { console.log("End Date is after Start Date"); return null }
    u.ID("menuTitleForAddMeals").innerHTML = menuTitle
    // create list of dates
    let dateList = []
    let end = false
    let i = 0
    while (end === false) {
        dateList[i] = new Date(Dict[3][menuTitle].startDate)
        dateList[i].setDate(startDate.getDate() + i);
        if (dateList[i].getDate() === endDate.getDate()) { end = true }
        if (i === 20) { end = true; console.log("date range too large") }
        i++
    }
    let dateEnum = []
    for (let j = 0; j < dateList.length; j++) {
        let x = dateList[j]
        dateEnum[j] = `${e.weekday[x.getDay()]} (${u.GetFormalDate(x)})`
    }
    u.ClearDropdown("selectDayForAddMeals", "Select Day")
    u.CreateDropdown("selectDayForAddMeals", dateEnum, false, dateList)
    CreateMealList()
    u.ID("addMealsToMenu").style = "display: block"
}
function CreateMealList() { // creates the meal list on the right of the add meal modal, and adds delete buttons that remove a meal and reload the list
    let menuTitle = u.ID("menuTitleForAddMeals").innerHTML
    u.SetValues([["selectMealTypeForAddMeals", "Select Meal"]])
    let mealDiv = u.ID("currentMealList")
    mealDiv.innerHTML = ""
    let menu = Dict[3][menuTitle]
    for (let i = 0; i < menu.meals.length; i++) {
        let meal = Dict[3].getMeal(menuTitle, i)
        let day = e.weekday[new Date(meal.date).getDay()]
        let mealTitleDiv = u.CreateElement("div", mealDiv, "", "listItem")
        let mealTitle = u.CreateElement("text", mealTitleDiv, "", "recipeTitle", `${day} ${meal.mealType}`);

        let deleteMealFromMenu = u.CreateElement("button", mealTitleDiv, "", "removeRecipe", "x")
        deleteMealFromMenu.addEventListener("click", function () {
            Dict[3].deleteMeal(menuTitle, i)
            u.WriteDict(3)
            CreateMealList()
        })
    }
}
function AddMealBtn() {// adds event listener for the 'add meal' button in the add meal modal
    let menuTitle = u.ID("menuTitleForAddMeals").innerHTML
    let mealID = Dict[3].addMeal(menuTitle, u.ID("selectMealTypeForAddMeals").value, new Date(u.ID("selectDayForAddMeals").value))
    if (u.ID("selectMealTypeForAddMeals").value === "breakfast") {
        Dict[3].addRecipe(menuTitle, mealID, "Standard Breakfast", "b")
    }
    u.WriteDict(3)
    CreateMealList()
}

module.exports = {
    AddMeal: AddMealBtn, // add meal to menu
    CreateAddMealModal: CreateAddMealModal, // create (and show) the add meal modal
    onLoad: onLoad
}