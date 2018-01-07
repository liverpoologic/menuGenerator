var u = require("./UtilityFunctions.js")    
var d = require("./Dicts.js") 
var Dict = d.Dict 

// onLoad
u.ID("addRecipe_btn").addEventListener("click", AddRecipeBtn)    

function AddRecipeBtn() {
    let title = u.ID("recipeTitle").value
    let mealType = u.ID("selectRecipeMealType").value
    let recipeType = u.ID("selectRecipeType").value
    let serves = parseInt(u.ID("recipeServes").value)
    let method = u.ID("recipeMethod").value
    let morvInput = u.ID("recipeMorv").value

    if (morvInput === "v / b") {
        Dict[2].addRecipe(title, mealType, ["v", "b"], serves, method, recipeType)
    }
    else (
        Dict[2].addRecipe(title, mealType, [morvInput], serves, method, recipeType)
    )
    //ADD INGREDIENTS 
    for (let i = 0; i + 1 < u.ID("ingredientTable").rows.length; i++) {
        let foodName = u.ID(`selectIngredientFood${i}`).value
        let quantitySmall = parseFloat(u.ID(`ingredientQuantitySmall${i}`).value)
        if (u.ID(`selectIngredientMorv${i}`).value === "null") {
            Dict[2].addIngredient(title, foodName, quantitySmall, null)
        }
        else {
            let morv = u.ID(`selectIngredientMorv${i}`).value
            Dict[2].addIngredient(title, foodName, quantitySmall, morv)
        };
        u.ID(`selectIngredientFood${i}`).value = "Food"
        u.ID(`ingredientQuantitySmall${i}`).value = ""
        u.ID(`selectIngredientMorv${i}`).value = "null"
    }

    for (let i = u.ID("ingredientTable").rows.length; i > 2; i--) {
        u.ID("ingredientTable").deleteRow(i - 1);
    }
    u.WriteDict(2)
    u.SetValues([["recipeTitle", ""], ["selectRecipeMealType", "Meal Type"], ["selectRecipeType", "Recipe Type"], ["recipeMorv", "morv"], ["recipeServes", ""], ["recipeMethod", ""]])
}
//
function CreateIngredientTable() {
    u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "-", "+"],"",[40, 18, 12, 12, 6, 6], "%")
    AddIngredientsRow()
}
// create row in ingredients table - currently doesn't work if you start deleting random (non-end). Need to block user from removing past lines.    
function AddIngredientsRow() {
    let j = u.ID("ingredientTable").rows.length - 1;
    let colhtml = []
    colhtml.push("<select id='selectIngredientFood" + j + "'><option>Food</option></select>")
    colhtml.push("<input type='number' id='ingredientQuantitySmall" + j + "' style='width:100%'>")
    colhtml.push("<text id ='ingredientUnitDisplay" + j + "'>")
    colhtml.push("<select id='selectIngredientMorv" + j + "'><option>null</option></select>")
    colhtml.push("<input type='button' id='-ingbtn" + j + "' value='-' >")
    colhtml.push("<input type='button' id='+ingbtn" + j + "' value='+' >")

    u.CreateRow("ingredientTable", "td", colhtml,"",[40, 18, 12, 12, 6, 6], "%")
    u.CreateDropdown(`selectIngredientFood${j}`, Dict[1], true) // recipe > add ingredients
    u.CreateDropdown(`selectIngredientMorv${j}`, d.morvEnum, false) // recipe > morv            

    u.ID(`selectIngredientFood${j}`).addEventListener("change", DisplayUnit)

    function DisplayUnit() {
        if (u.ID(`selectIngredientFood${j}`).value === "Food") {
            u.ID(`ingredientUnitDisplay${j}`).innerText = ""
        }
        else {
            let x = Dict[1][u.ID(`selectIngredientFood${j}`).value].unit
            u.ID(`ingredientUnitDisplay${j}`).innerText = x
        }
    }
    u.ID(`+ingbtn${j}`).addEventListener("click", AddIngredientsRow)
    u.ID(`-ingbtn${j}`).addEventListener("click", function () {
        u.ID("ingredientTable").deleteRow(j + 1);
    })
}

module.exports = {
    CreateIngredientTable:CreateIngredientTable,
    AddIngredientsRow:AddIngredientsRow
}