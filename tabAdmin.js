// this is only used in the 'onLoad' and 'utilityfunctions', not in renderer itself.

var d = require("./Dicts.js")
var u = require("./UtilityFunctions.js")
var addRecipe = require("./tabAddRecipe.js")
var Dict = d.Dict
var e = d.Dict[4]

module.exports = {
    CreateTable:CreateTable, // creates / refreshes an admin table
    CreateTableContents: CreateTableContents, // creates / refreshes a given dictionary table's contents
    RefreshEnumTable: RefreshEnumTable, // refreshes enum table contents
    onLoad: onLoad
}


function onLoad() {
    u.ID("ingredientSearchInput").addEventListener("change", function () { // event listener so table is recreated when ingredient filter is changed
        CreateTableContents(2)
    })
    u.ID("clearIngredientSearch").addEventListener("click", function () { // event listener to clear table when 'x' is clicked next to ingredient filter
        u.ID("ingredientSearchInput").value = ""
        CreateTableContents(2)
    })
    u.ID("selectAdminEnum").addEventListener("change", RefreshEnumTable)
    CreateTable(1)
    CreateTable(2)
    CreateTable(3)

    // create event listener for 'save changes' button to support t2 > 'edit recipe' functionality
    u.ID("editRecipe_btn").addEventListener("click", SaveChangesRecipe)
}

/** creates / refreshes a given dictionary admin table */
function CreateTable(tableID) { // create admin table header and filter row, then calls CreateTableContents (clear existing and then create)
    var e = d.Dict[4]
    let table = u.ID(`t${tableID}Table`)
    table.innerHTML = "" // clear table
    if (tableID === 1) {
        u.CreateRow("t1Table", "th", ["Food Name", "Unit", "Shop", "Type", "-"], "", [40, 15, 15, 15, 5], "%")
        CreateFilterRow(1, ["longText", "longText", "select", "select", null], [true])
        u.CreateDropdown("t1TableFilter2input", e.shopEnum, false)
        u.CreateDropdown("t1TableFilter3input", e.foodTypeEnum, false)
    }
    else if (tableID === 2) {
        u.CreateRow("t2Table", "th", ["Recipe Title", "Meal", "Type", "Serves", "Morv", "-"], "", [55, 15, 15, 10, 10, 5], "%")
        CreateFilterRow(2, ["longText", "select", "select", null, "select", null])
        u.CreateDropdown("t2TableFilter1input", e.mealTypeEnum, false)
        u.CreateDropdown("t2TableFilter2input", e.recipeTypeEnum, false)
        u.CreateDropdown("t2TableFilter4input", e.morvEnum, false)
    }
    else if (tableID === 3) {
        u.CreateRow("t3Table", "th", ["Menu Title", "Start Date", "End Date", "-"], "", [40, 30, 30, 10], "%")
        CreateFilterRow(3, ["longText", null, null, null])
    }
    CreateTableContents(tableID)
}

/**create filter row (i.e. select/text inputs 
 * @param {number} dictID id of dictionary (1,2 or 3)
 * @param {array} filterType array including each filter type from left to right e.g. ["longText,"text","number","select",null] - null means no input required. */
function CreateFilterRow(dictID, filterType) {
    let tableID = `t${dictID}Table`
    let Table = u.ID(tableID)
    let filterRow = Table.insertRow()
    for (let i = 0; i < filterType.length; i++) {
        let filterCell = u.CreateElement("th", filterRow)
        filterCell.addEventListener("change", function () {
            CreateTableContents(dictID)
        })

        if (filterType[i] === "select") {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<select id=${tableID}Filter${i}input><option value="All">All</option></select>`)
        }
        else if (filterType[i] === "longText") {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<input id=${tableID}Filter${i}input type='text' style='width:80%'><button id=${tableID}Filter${i}clear class='insideCellBtn'>x</button>`)
            u.ID(`${tableID}Filter${i}clear`).addEventListener("click", function () {
                u.ID(`${tableID}Filter${i}input`).value = ""
                CreateTableContents(dictID)
            })
        }
        else if (filterType[i] !== null) {
            u.Html(filterCell, `${tableID}Filter${i}`, "", "", `<input id=${tableID}Filter${i}input type='${filterType[i]}' class='tableTextInput'>`)
        }
    }
}

/** Refresh contents of a given admin table
 * @param {number} dictID ID of the table (1,2 or 3). */
function CreateTableContents(dictID) {
    var e = d.Dict[4]
    let table = u.ID(`t${dictID}Table`)
    u.ClearTable(table.id, 2)
    let dictKeys = Object.keys(Dict[dictID]).sort()
    for (let i = 0; i < dictKeys.length; i++) {
        let rowKey = Dict[dictID][dictKeys[i]]
        if (typeof rowKey === "function") { continue } //ignore if rowKey is a function (as shouldn't be displayed in the table)
        let j = table.rows.length - 1;

        if (dictID === 1) {
            let filter = Filter(1, i, [["key", ""], ["unit", ""], ["shop", "all"], ["foodType", "all"]])
            if (filter === false) { continue }
            let cellIDs = [`t1TableKey${j}`, `t1TableUnit${j}`, `t1TableShop${j}`, `t1TableFoodType${j}`, `t1RemoveLinebtn${j}`]
            let cellContents = [dictKeys[i], rowKey.unit, rowKey.shop, rowKey.foodType, "<input type='button' value='-'>"]
            u.CreateRow("t1Table", "td", cellContents, cellIDs)
            u.CreateEditCellListeners(`t1TableUnit${j}`, "text", `t1TableKey${j}`, 1, "unit")
            u.CreateEditCellListeners(`t1TableShop${j}`, "select", `t1TableKey${j}`, 1, "shop", e.shopEnum, false)
            u.CreateEditCellListeners(`t1TableFoodType${j}`, "select", `t1TableKey${j}`, 1, "foodType", e.foodTypeEnum, false)

            // add listener to enable edit food name
            u.ID(`t1TableKey${j}`).addEventListener("click", EditFoodName)
        }
        else if (dictID === 2) {
            let filter = Filter(2, i, [["key", ""], ["mealType", "all"], ["recipeType", "all"], null, ["morv", "all"]])
            if (filter === false) { continue }
            filter = FilterIngredient(i) // checks that ingredient isn't being filtered out
            if (filter === false) { continue }
            let cellIDs = [`t2TableKey${j}`, `t2TableMeal${j}`, `t2TableType${j}`, `t2TableServes${j}`, `t2TableMorv${j}`, `t2RemoveLinebtn${j}`]
            let cellContents = [dictKeys[i], rowKey.mealType, rowKey.recipeType, rowKey.serves, rowKey.morv, "<input type='button' value='-'>"]
            u.CreateRow("t2Table", "td", cellContents, cellIDs)

            u.CreateEditCellListeners(`t2TableMeal${j}`, "select", `t2TableKey${j}`, 2, "mealType", e.mealTypeEnum, false)
            u.CreateEditCellListeners(`t2TableType${j}`, "select", `t2TableKey${j}`, 2, "recipeType", e.recipeTypeEnum, false)

            // edit morv cell                        
            u.ID(`t2TableMorv${j}`).addEventListener("click", function editCell() {
                let cell = u.ID(`t2TableMorv${j}`)
                let key = u.ID(`t2TableKey${j}`).innerText
                let oldValue = Dict[2][key]["morv"]
                cell.innerHTML = "<select id='Input_t2TableMorv" + j + "'><option>" + oldValue + "</option></select><input type='button' value='✔' id='Save_t2TableMorv" + j + "'>"
                u.CreateDropdown(`Input_t2TableMorv${j}`, e.morvOpts, false)
                cell.className = "tableInput"
                u.ID(`t2TableMorv${j}`).removeEventListener("click", editCell)
                u.ID(`Save_t2TableMorv${j}`).addEventListener("click", function () {
                    let newValue = u.ID(`Input_t2TableMorv${j}`).value
                    if (newValue === "v / b") { Dict[2][key]["morv"] = ["v", "b"] }
                    else { Dict[2][key]["morv"] = [newValue] }
                    u.WriteDict(2)
                })
            })
            // create event listener for clicking a recipeTitle in the admin screen and moving to add recipe screen 
            u.ID(`t2TableKey${j}`).addEventListener("click", function () {
                let recipe = Dict[2][u.ID(`t2TableKey${j}`).innerText]
                let recipeTitle = u.ID(`t2TableKey${j}`).innerText
                u.SetValues([["recipeTitle", recipeTitle], ["selectRecipeMealType", recipe.mealType], ["selectRecipeType", recipe.recipeType], ["recipeServes", recipe.serves], ["recipeMethod", recipe.method]])
                u.ID("AddRecipePageTitle").innerText = "Edit Recipe" // change 'add recipe' to 'edit recipe' at top of addRecipe tab
                if (recipe.morv.length > 1) { u.ID("recipeMorv").value = "v / b" } // if morv is ["v","b"] display "v / b"
                else { u.ID("recipeMorv").value = recipe.morv }
                u.ClearTable("ingredientTable", 1)
                // loop to add ingredients
                let ingredientKey = Object.keys(recipe.ingredients)
                for (let i = 0; i < ingredientKey.length; i++) {
                    addRecipe.AddIngredientsRow()
                    let ingredient = Dict[2].getIngredient(recipeTitle, ingredientKey[i])
                    u.SetValues([[`selectIngredientFood${i}`, ingredientKey[i]], [`ingredientQuantitySmall${i}`, ingredient.quantitySmall], [`selectIngredientMorv${i}`, ingredient.morv]])
                    u.ID(`ingredientUnitDisplay${i}`).innerText = ingredient.food.unit
                }
                // open the AddRecipe tab and show 'save changes' button = editRecipe_btn
                u.HideElements("addRecipe_btn")
                u.ShowElements("editRecipe_btn", "inline")
                u.OpenHTab("AddRecipe")
            })
        }
        else if (dictID === 3) {
            let filter = Filter(3, i, [["key", ""]])
            if (filter === false) { continue }

            // generate display for start and end date
            let rawStartDate = (new Date(rowKey.startDate))
            let rawEndDate = (new Date(rowKey.endDate))

            let startDay = rawStartDate.getDate()
            let startMonth = rawStartDate.getMonth() + 1
            let startYear = rawStartDate.getFullYear()
            let startDate = `${startDay}/${startMonth}/${startYear}`

            let endDay = rawEndDate.getDate()
            let endMonth = rawEndDate.getMonth() + 1
            let endYear = rawEndDate.getFullYear()
            let endDate = `${endDay}/${endMonth}/${endYear}`
            //

            let cellIDs = [`t3TableKey${j}`, `t3TableStartDate${j}`, `t3TableEndDate${j}`, `t3RemoveLinebtn${j}`]
            let cellContents = [dictKeys[i], startDate, endDate, "<input type='button' value='-'>"]
            u.CreateRow("t3Table", "td", cellContents, cellIDs)

            u.CreateEditCellListeners(`t3TableStartDate${j}`, "date", `t3TableTitle${j}`, 3, "startDate")
            u.CreateEditCellListeners(`t3TableEndDate${j}`, "date", `t3TableTitle${j}`, 3, "endDate")
        }
        // event listener to delete row
        let deleteRowContents = [null, "deleteFood", "deleteRecipe", "deleteMenu"]
        if (u.ID(`t${dictID}RemoveLinebtn${j}`) === null) { continue }
        u.ID(`t${dictID}RemoveLinebtn${j}`).addEventListener("click", function () {
            Dict[dictID][deleteRowContents[dictID]](u.ID(`t${dictID}TableKey${j}`).innerText)
            u.WriteDict(dictID)
        })
        //
    }
}

/** allows user to edit the food name in t1Table */
function EditFoodName() {
    let j = u.GetNumber(event.target.id)
    let cell = u.ID(`t1TableKey${j}`)
    let oldValue = cell.innerText
    cell.innerHTML = `<input type='text' id='t1TableFoodNameInput${j}' value='${oldValue}'><button id='t1TableFoodNameSave${j}' class='insideCellBtn'>✔</button>`
    cell.className = "tableInput"
    u.ID(`t1TableKey${j}`).removeEventListener("click", EditFoodName)
    u.ID(`t1TableFoodNameSave${j}`).addEventListener("click", function () { ChangeFoodName(j, oldValue) })
}

/** changes the food name from the old value to the current value of the cell, and changes t2 and t3 */
function ChangeFoodName(j, oldValue) {
    let newValue = u.ID(`t1TableFoodNameInput${j}`).value
    u.RenameKey(oldValue, newValue, Dict[1])
    // check whether food is present in any recipes
    let recipeKeys = Object.keys(Dict[2])
    var impactedRecipes = []
    for (let k = 0; k < recipeKeys.length; k++) {
        let recipe = Dict[2][recipeKeys[k]]
        if (typeof recipe === "function") { continue }
        let ingredientKeys = Object.keys(recipe.ingredients)
        for (let x = 0; x < ingredientKeys.length; x++) {
            if (oldValue === ingredientKeys[x]) {
                u.RenameKey(oldValue, newValue, recipe.ingredients)
                impactedRecipes.push(recipeKeys[k])
            }
        }
    }
    // check whether food is present in any menus (t3) and change foodName if it is
    let menuKeys = Object.keys(Dict[3]).sort()
    for (let k = 0; k < menuKeys.length; k++) {
        let menuTitle = menuKeys[k]
        if (typeof Dict[3][menuTitle] === "function") { continue }
        let mealKeys = Object.keys(Dict[3][menuTitle].meals)
        for (let x = 0; x < mealKeys.length; x++) {
            let mealNo = parseInt(mealKeys[x])
            let recipeKeys = Object.keys(Dict[3][menuTitle].meals[mealNo].recipes)
            for (let y = 0; y < recipeKeys.length; y++) {
                let recipeNo = parseInt(recipeKeys[y])
                let recipe = Dict[3].getRecipe(menuTitle, mealNo, recipeNo)
                let recipeTitle = recipe.recipeTitle
                if (impactedRecipes.indexOf(recipeTitle) > -1) { //is recipe in our array 'impactedRecipes' - if yes, then delete and re-add.
                    let morv = recipe.morv
                    Dict[3].deleteRecipe(menuTitle, mealNo, recipeNo)
                    Dict[3].addRecipe(menuTitle, mealNo, recipeTitle, morv)
                }
            }
        }
    }
    u.WriteDict(0)
}

/** returns false if value should be filtered out, true if the value should be displayed. EG: let filter = Filter(2, i, [["key", ""], null, ["morv", "all"]])
 * @param {number} dictID id of dictionary (1,2 or 3)
 * @param {number} id usually a variable i - number of the dictKey being filtered on
 * @param {array} parameters  e.g. [["property1", "nullvalue1"],null, ["property2", "nullvalue2"]] note that nullValue would normally be "" or "all" and must be in lower case. use a null string if a column has no filter applied*/
function Filter(dictID, id, parameters) { //returns false if value should be filtered out, true if the value should be displayed
    let keys = Object.keys(Dict[dictID]).sort()
    let filter = []
    let filterBool = []

    for (let i = 0; i < parameters.length; i++) {
        if (parameters[i] === null) { filterBool[i] = true; continue }
        let thing = Dict[dictID][keys[id]]
        let thingName = keys[id].toLowerCase()
        let property = parameters[i][0] // this is the property of the dictionary object that is being compared
        if (typeof u.ID(`t${dictID}TableFilter${i}input`).value === "string") { // changes to lower case to ensure no case mismatches
            filter[i] = u.ID(`t${dictID}TableFilter${i}input`).value.toLowerCase()
        }
        else { filter[i] = u.ID(`t${dictID}TableFilter${i}input`).value }
        filterBool[i] = false
        if (filter[i] === parameters[i][1]) { filterBool[i] = true; continue }
        if (parameters[i][0] === "key") {
            if (thingName.indexOf(filter[i]) > -1) { filterBool[i] = true; continue }
        }
        else {
            let thingProperty
            if (typeof thing[property] === "string") { thingProperty = thing[property].toLowerCase() }
            else { thingProperty = thing[property] }

            if (thingProperty === null) { continue }
            else if (thingProperty.indexOf(filter[i]) > -1) { filterBool[i] = true }
        }
    }
    let result = true
    for (let i = 0; i < filterBool.length; i++) {
        if (filterBool[i] === false) { result = false }
    }
    return result
}

/** returns false if a recipe doesn't have the 'ingredient filter' string in any of its ingredients
 * @param {number} i number of the sorted Dict[2]key id for that recipe */
function FilterIngredient(i) {
    let filter = u.ID("ingredientSearchInput").value.toLowerCase()
    let recipeKeys = Object.keys(Dict[2]).sort()
    let ingredients = Dict[2][recipeKeys[i]].ingredients
    let ingredientsKeys = Object.keys(ingredients)
    let result = false
    for (let j = 0; j < ingredientsKeys.length; j++) {
        let ingredient = ingredientsKeys[j]
        if (ingredient.indexOf(filter) > -1) { result = true; break }
    }
    return result
}

/** saves changes to edited recipe, and returns user to admin screen */
function SaveChangesRecipe() {
    let recipeTitle = u.ID("recipeTitle").value
    d.Dict[2].deleteRecipe(recipeTitle)
    addRecipe.btn()
    // check if recipe is in any menus
    let menuKeys = Object.keys(Dict[3]).sort()
    for (let k = 0; k < menuKeys.length; k++) {
        let menuTitle = menuKeys[k]
        if (typeof Dict[3][menuTitle] === "function") { continue }
        let mealKeys = Object.keys(Dict[3][menuTitle].meals)
        for (let x = 0; x < mealKeys.length; x++) {
            let mealNo = parseInt(mealKeys[x])
            console.log(Dict[3][menuTitle].meals[mealNo])
            let recipeKeys = Object.keys(Dict[3][menuTitle].meals[mealNo].recipes)
            for (let y=0; y<recipeKeys.length; y++){
                let recipe = Dict[3][menuTitle].meals[mealNo].recipes[y]
                if(recipe.recipeTitle === recipeTitle){
                    let morv = recipe.morv
                    Dict[3].deleteRecipe(menuTitle, mealNo, y)
                    Dict[3].addRecipe(menuTitle, mealNo, recipeTitle, morv)
                }
            }
        }
    }
    u.WriteDict(0)
    u.ID("AddRecipePageTitle").innerText = "Add Recipe"  // change text of title back from 'edit recipe' to 'add recipe'
    u.ShowElements("addRecipe_btn", "inline")
    u.HideElements("editRecipe_btn")
    u.OpenHTab("Admin")
    u.OpenVTab("t2RecipeDict")
}

/** displays elements of an enum */
function RefreshEnumTable() {
    u.ID("enumTableDiv").innerHTML = ""
    let enumName = u.ID("selectAdminEnum").value
    let enumObj = e[enumName]
    if (enumName === "Select an Enum") { return false }
    u.CreateElement("table", u.ID("enumTableDiv"), "enumTable")
    for (let i = 0; i < enumObj.length; i++) {
        u.CreateRow("enumTable", "td", [enumObj[i], "⇧", "⇩", "×"], [`enumObj${i}`, `enumObjUp${i}`, `enumObjDown${i}`, `enumObjDelete${i}`], [200, 15, 15, 15], "px")
        u.ID(`enumObj${i}`).addEventListener("click", EditEnumName)
        u.ID(`enumObjUp${i}`).addEventListener("click", MoveEnumObj)
        u.ID(`enumObjDown${i}`).addEventListener("click", MoveEnumObj)
        u.ID(`enumObjDelete${i}`).addEventListener("click", DeleteEnumObj)
    }
    u.CreateElement("button", u.ID("enumTableDiv"), "addEnumItem", "", "add new item")
    u.ID("addEnumItem").addEventListener("click", AddEnumItem)
}

/** allows user to add an item to an enum */
function AddEnumItem() {
    let enumName = u.ID("selectAdminEnum").value
    e[enumName].push("")
    u.WriteDict(4)
}

/** allows user to edit the food name in t1Table */
function EditEnumName() {
    let j = u.GetNumber(event.target.id)
    let cell = u.ID(`enumObj${j}`)
    let oldValue = cell.innerText
    cell.innerHTML = `<input type='text' id='enumObjInput${j}' value='${oldValue}'><button id='enumObjSave${j}' class='insideCellBtn'>✔</button>`
    cell.className = "tableInput"
    u.ID(`enumObj${j}`).removeEventListener("click", EditEnumName)
    u.ID(`enumObjSave${j}`).addEventListener("click", function () { ChangeEnumName(oldValue) })
}

/** changes the food name from the old value to the current value of the cell */
function ChangeEnumName(oldValue) {
    let j = u.GetNumber(event.target.id)
    let newValue = u.ID(`enumObjInput${j}`).value
    let enumObj = e[u.ID("selectAdminEnum").value]
    delete enumObj[j]
    enumObj[j] = newValue
    if(u.ID("selectAdminEnum").value === "foodTypeEnum"){ // if you are changing food-type-enum, change types of food in Dict[1]
        let foodKeys = Object.keys(Dict[1])
        for(let i=0; i<foodKeys.length; i++){
            let foodName = foodKeys[i]
            let food = Dict[1][foodName]
            if (typeof food === "function") {continue}
            else if (food.foodType === oldValue){
                food.foodType = newValue
            }
        }
    }
    if(u.ID("selectAdminEnum").value === "shopEnum"){ // if you are changing shopping-enum, change types of shop in Dict[1], Dict[2] and Dict[3]
        let foodKeys = Object.keys(Dict[1])
        for(let i=0; i<foodKeys.length; i++){
            let foodName = foodKeys[i]
            let food = Dict[1][foodName]
            if (typeof food === "function") {continue}
            else if (food.shop === oldValue){
                food.shop = newValue
            }
        }
    }
    u.WriteDict(0)
}

/** moves an enum up or down */
function MoveEnumObj() {
    let i = u.GetNumber(event.target.id)
    if (i === 0) { return false }
    let enumName = u.ID("selectAdminEnum").value
    let j
    if (event.target.id.charAt(7) === "U") { j = i - 1 }
    else { j = i + 1 }
    u.Swap(e[enumName], i, j)
    u.WriteDict(0)
}

function DeleteEnumObj() {
    let i = u.GetNumber(event.target.id)
    let enumName = u.ID("selectAdminEnum").value
    e[enumName].splice(i, 1)
    u.WriteDict(0)
}
