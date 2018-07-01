var u = require("./UtilityFunctions.js")
var d = require("./Dicts.js")
var addMenu = require("./tabAddMenu.js")
var Dict = d.Dict
var e = d.Dict[4]

var mealTypeFilter, recipeTypeFilter, morvFilter

module.exports = {
    RefreshEditMenu: RefreshEditMenu, // refresh edit menu screen in response to selected menu
    onLoad:onLoad
}

function onLoad() {
    u.ID("addRecipeApplyFilters").addEventListener("click", ApplyFilters) // apply filters button in add recipe modal
    u.ID("addRecipeClearFilters").addEventListener("click", ClearFiltersBtn) // clear filters button in add recipe modal
    u.ID("addRecipeToMenu_submit").addEventListener("click", AddRecipeToMenu) // add recipes to menu (submit button)
    u.ID("selectEditMenu").addEventListener("change", RefreshEditMenu) // reload menu when new menuTitle is selected
    u.ID("selectMenuForNewRecipe").addEventListener("change", RefreshAddRecipeModal) // reload add recipe modal with details from new menuTitle
    u.ID("multiplyUp_submit").addEventListener("click", MultiplyUp) // multiply up a given menu when you press the 'submit' button in the multiply up modal

    u.ID("addRecipeToMenu_btn").addEventListener("click", function () { // show add recipe modal and refresh contents when button is clicked
        RefreshAddRecipeModal()
        u.ShowElements("addRecipeToMenu", "block")
    })
    u.ID("multiplyUp_btn").addEventListener("click", function () { // show multiple up modal when button is clicked
        u.ShowElements("multiplyUp", "block")
    })
    u.ID("editMealsEditMenu_btn").addEventListener("click", function () { // show 'edit meals' modal by calling addRecipe code when button is clicked
        addMenu.CreateAddMealModal(u.ID("selectEditMenu").value)
        u.ShowElements("addMealsToMenu", "block")
    })
    u.ID("addRecipeCancel_btn").addEventListener("click", function () { // hide add recipe modal when cancel button is pressed
        u.HideElements('addRecipeToMenu')
    })
    u.ID("multiplyUpCancel_btn").addEventListener("click", function () { // hide multiply up modal when cancel button is pressed
        u.HideElements("multiplyUp")
    })
    u.ID("selectRecipeForMenu").addEventListener("change", function () { // auto-select 'morv=b' for desserts
        let recipeValue = u.ID("selectRecipeForMenu").value
        if (recipeValue === "Choose Recipe") { return "no recipe selected" }
        if (Dict[2][recipeValue].recipeType === "dessert core") { u.ID("selectMorvForMenu").value = "b" }
    })


    // call function to create filter checkboxes in the 'add recipe' modal
    mealTypeFilter = CreateFilterList(e.mealTypeEnum, "mealTypeCheckbox", "mealTypeFilters")
    recipeTypeFilter = CreateFilterList(e.recipeTypeEnum, "recipeTypeCheckbox", "recipeTypeFilters")
    morvFilter = CreateFilterList(["b", "v", "m"], "morvCheckbox", "morvFilters")

}

/** function to create list of checkboxes - returns 'newEnum' which is the list of filter options including 'all'
 * @param {array} sourceEnum the enum which you want to generate the filter list from
 * @param {string} checkboxID the id prefix (followed by a number) you want for each checkbox
 * @param {string} divID the id of the div which these filter boxes are being added to
 */
function CreateFilterList(sourceEnum, checkboxID, divID) {
    // populate newEnum
    let newEnum = []
    newEnum[0] = "All"
    for (let i = 0; i < sourceEnum.length; i++) {
        newEnum[i + 1] = sourceEnum[i]
    }
    // create checkboxes
    for (let i = 0; i < newEnum.length; i++) {
        let checklist = u.ID(divID)
        let checkbox = u.CreateElement("input", checklist, `${checkboxID}${i}`)
        let checkboxLabel = u.CreateElement("label", checklist, "", "filterLabel", newEnum[i])
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("checked", "true")
        u.CreateElement("br", checklist)
    }
    // check everything on an 'all' box
    u.ID(`${checkboxID}0`).addEventListener("change", function () {
        if (this.checked) {
            for (let i = 1; i < newEnum.length; i++) {
                u.ID(`${checkboxID}${i}`).checked = true
            }
        }
        else {
            for (let i = 1; i < newEnum.length; i++) {
                u.ID(`${checkboxID}${i}`).checked = false
            }
        }
    })
    return newEnum
}
/** function to create an array of all permitted values (as per filters) at a particular point in time
 * @param {array} filterArray Array with all the checkbox names, usually created by the 'CreateFilterList' function
 * @param {string} checkboxID String which prefixes a number which is the ID of each checkbox (id1, id2 etc.)
 */
function CreateFilterArray(filterArray, checkboxID) {
    let result = []
    for (let i = 1; i < filterArray.length; i++) {
        if (u.ID(`${checkboxID}${i}`).checked === true) {
            result.push(filterArray[i])
        }
    }
    return result
}
/** Apply Filters to add recipe modal (so only filtered recipes are shown in the dropdown) */
function ApplyFilters() {
    // create recipe keys list
    let oldRecipeKeys = Object.keys(Dict[2])
    let filteredRecipeKeys = []
    let filteredMealTypeArray = CreateFilterArray(mealTypeFilter, "mealTypeCheckbox")
    let filteredRecipeTypeArray = CreateFilterArray(recipeTypeFilter, "recipeTypeCheckbox")
    let filteredMorvArray = CreateFilterArray(morvFilter, "morvCheckbox")

    // check if mealType is correct
    for (let i = 0; i < oldRecipeKeys.length; i++) {
        if (typeof Dict[2][oldRecipeKeys[i]] === "function") {
            continue
        }
        let mealType = Dict[2][oldRecipeKeys[i]].mealType
        let recipeType = Dict[2][oldRecipeKeys[i]].recipeType
        let morv = Dict[2][oldRecipeKeys[i]].morv

        let filteredMorv = null
        for (let j = 0; j < morv.length; j++) {
            if (filteredMorvArray.indexOf(morv[j]) > -1) { // check whether morv is present in morv array. If yes, filteredMorv = true
                filteredMorv = true
            }
        }
        if (
            filteredMealTypeArray.indexOf(mealType) > -1 && // if recipe fulfils all three criteria, add to filteredRecipeKeys
            filteredRecipeTypeArray.indexOf(recipeType) > -1 &&
            filteredMorv === true
        ) {
            filteredRecipeKeys.push(oldRecipeKeys[i])
        }
    }
    filteredRecipeKeys.sort()
    u.ClearDropdown("selectRecipeForMenu", "Choose Recipe")
    u.CreateDropdown("selectRecipeForMenu", filteredRecipeKeys, false)
}
/** Triggered when the 'clear filters' btn is clicked */
function ClearFiltersBtn() {
    ClearFilters(mealTypeFilter, "mealTypeCheckbox")
    ClearFilters(recipeTypeFilter, "recipeTypeCheckbox")
    ClearFilters(morvFilter, "morvCheckbox")
}
/** Clears the Filters for a given filterEnum
 * @param {array} filterEnum this is the enum with the list of options including 'all'
 * @param {string} checkboxID this is the ID of each checkbox (followed by a number)
 */
function ClearFilters(filterEnum, checkboxID) {
    for (let i = 0; i < filterEnum.length; i++) {
        u.ID(`${checkboxID}${i}`).checked = true
    }
}
/** Add a recipe to a menu (using data from addRecipeToMenu modal) */
function AddRecipeToMenu() {
    let menuTitle = u.ID("selectMenuForNewRecipe").value
    let mealID = parseInt(u.ID("selectMealForMenu").value)
    let recipeTitle = u.ID("selectRecipeForMenu").value
    let morv = u.ID("selectMorvForMenu").value

    Dict[3].addRecipe(menuTitle, mealID, recipeTitle, morv)
    u.WriteDict(3)
    RefreshEditMenu()
    u.SetValues([["selectMealForMenu", "Choose Meal"], ["selectRecipeForMenu", "Choose Recipe"], ["selectMorvForMenu", "Choose Morv"]])
}
/** create select meal dropdown from menu (in edit menu > add recipe) */
function RefreshAddRecipeModal() {
    u.ClearDropdown("selectMealForMenu", "Choose Meal")
    // create meal enum & dropdon          
    let menu = Dict[3][u.ID("selectMenuForNewRecipe").value]
    let mealEnum = []
    for (let i = 0; i < menu.meals.length; i++) {
        let day = e.weekday[new Date(menu.meals[i].date).getDay()]
        mealEnum.push(`${day} ${menu.meals[i].mealType}`)
    }
    // creating my own dropdown as needs different displays and values
    let values = []
    for (let i = 0; i < mealEnum.length; i++) { values[i] = i }
    u.CreateDropdown("selectMealForMenu", mealEnum, false, values)
}
/** multiply up the menu from inputs in the multiply up modal */
function MultiplyUp() {
    let menuTitle = u.ID("selectMenuForMultiplyUp").value
    let meateaters = parseInt(u.ID("multiplyUpMeateaters").value)
    let vegetarians = parseInt(u.ID("multiplyUpVegetarians").value)

    Dict[3].multiplyUp(menuTitle, meateaters, vegetarians)
    u.WriteDict(3)
    u.SetValues([["selectMenuForMultiplyUp", "Choose Menu"], ["multiplyUpMeateaters", ""], ["multiplyUpVegetarians", ""], ["selectViewMenu", menuTitle]])
    u.HideElements("multiplyUp")
}
/** generates a list of meals and recipes */
function RefreshEditMenu() {
    let menuTitle = u.ID("selectEditMenu").value
    let menuDiv = u.ID("editMenuDiv")
    menuDiv.innerHTML = ""
    let editBtnIDs = ["addRecipeToMenu_btn", "multiplyUp_btn", "editMealsEditMenu_btn"]
    if (menuTitle === "Menu") { // clears page (i.e. edit buttons) if no menu is selected and ends function
        u.HideElements(editBtnIDs)
        return "menuTitle not selected"
    }
    u.ShowElements(editBtnIDs, "inline") // dislay the three edit buttons
    u.SetValues([["selectMenuForMultiplyUp", menuTitle], ["selectMenuForNewRecipe", menuTitle]]) // set menu titles in add recipe modal and multiply up modal

    let menu = Dict[3].getMenu(menuTitle)
    for (let i = 0; i < menu.meals.length; i++) {
        // generate and display meal title e.g. Friday Dinner
        let meal = Dict[3].getMeal(menuTitle, i)
        let day = e.weekday[new Date(meal.date).getDay()]
        let mealTitle = u.CreateElement("text", menuDiv)
        u.Html(mealTitle, `mealTitle${i}`, "mealTitle", "display:inline-block", "", `${day} ${meal.mealType}`)

        // generate and display the mealDiv where the recipes for that meal will go
        let mealDiv = u.CreateElement("div", menuDiv, `mealDiv${i}`)

        for (let j = 0; j < meal.recipes.length; j++) {
            let recipe = Dict[3].getRecipe(menuTitle, i, j)
            let recipeTitleDiv = u.CreateElement("div", mealDiv, `recipeTitleDiv${i}${j}`, "listItem")
            let recipeTitle = u.CreateElement("text", recipeTitleDiv, `recipeTitle${i}${j}`, "recipeTitle");
            if (recipe === null) { continue }
            if (recipe.morv === "b") { recipeTitle.innerText = `${recipe.recipeTitle}` }
            else { recipeTitle.innerText = `${recipe.recipeTitle} - ${recipe.morv}` }

            // ["core","veg","starch","sauce","other","dessert c","dessert other"] 
            let recipeColors = ["#264D9B", "#5E81C5", "#85A2DC", "#B5C9F0", "#CCCCCC", "#23D08A", "#71E6B7"]
            for (let i = 0; i < e.recipeTypeEnum.length; i++) {
                if (recipe.recipeType === e.recipeTypeEnum[i]) { recipeTitleDiv.style.backgroundColor = recipeColors[i]; break }
            }
            if (recipe.recipeType === "core") { recipeTitleDiv.style.color = "white" }

            let deleteRecipeFromMenu = u.CreateElement("button", recipeTitleDiv, `deleteRecipe${i}${j}`, "removeRecipe", "x")
            deleteRecipeFromMenu.addEventListener("click", function () {
                Dict[3].deleteRecipe(menuTitle, i, j)
                u.WriteDict(3)
            })
        }
    }
}