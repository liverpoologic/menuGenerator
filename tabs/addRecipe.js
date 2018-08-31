var u = require("../UtilityFunctions.js");
var d = require("../Dicts.js");
var Dict = d.Dict;
var Config = d.Config;

function onLoad(){
    u.ID("addRecipe_btn").addEventListener("click", AddRecipeBtn);
    CreateIngredientTable();
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
        Dict.recipes.addRecipe(title, mealType, ["v", "b"], serves, method, recipeType);
    }
    else {
        Dict.recipes.addRecipe(title, mealType, [morvInput], serves, method, recipeType);
    }

    for (let i = 0; i+1 < u.ID("ingredientTable").rows.length; i++) {
        let foodName = u.ID(`selectIngredientFood${i}`).value;
        let quantitySmall = parseFloat(u.ID(`ingredientQuantitySmall${i}`).value);
        if (u.ID(`selectIngredientMorv${i}`).value === "morv" || u.ID(`selectIngredientMorv${i}`).value === "null") {
            Dict.recipes.addIngredient(title, foodName, quantitySmall, 'b');
        }
        else {
            let morv = u.ID(`selectIngredientMorv${i}`).value;
            Dict.recipes.addIngredient(title, foodName, quantitySmall, morv);
        }
        u.ID(`selectIngredientFood${i}`).value = "Food";
        u.ID(`ingredientQuantitySmall${i}`).value = "";
        u.ID(`selectIngredientMorv${i}`).value = "morv";
    }

    for (let i = u.ID("ingredientTable").rows.length; i > 2; i--) {
        u.ID("ingredientTable").deleteRow(i - 1);
    }
    u.WriteDict(2);
    u.SetValues([["recipeTitle", ""], ["selectRecipeMealType", "Meal Type"], ["selectRecipeType", "Recipe Type"], ["recipeMorv", "morv"], ["recipeServes", ""], ["recipeMethod", ""]]);
}

/** creates the ingredient table in the add recipe tab */
function CreateIngredientTable() {
    u.CreateRow("ingredientTable", "th", ["Food", "Quantity", "", "Morv", "-", "+"],["","","","","","addIngRowHeader"],[210,90,60,60,15,15], "px");
    AddIngredientsRow();
    u.ID("addIngRowHeader").addEventListener("click", AddIngredientsRow);
}

/** creates a row in the ingredients table, icluding the 'remove row' listener */
function AddIngredientsRow() {
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

    u.CreateRow("ingredientTable", "td", colhtml,["","",`ingredientUnitDisplay${j}`,"",`-ingbtn${j}`,`+ingbtn${j}`,`upbtn${j}`,`downbtn${j}`],[210,90,60,60,15,15,15,15], "px");

    u.CreateDropdown(`selectIngredientFood${j}`, Dict.foods, true,undefined,'Food'); // recipe > add ingredients
    u.CreateDropdown(`selectIngredientMorv${j}`, d.Config.enums.morvEnum, false,undefined,'morv'); // recipe > morv

    u.ID(`selectIngredientFood${j}`).addEventListener("change", DisplayUnit);

    u.ID(`+ingbtn${j}`).addEventListener("click", AddIngredientsRow);
    u.ID(`-ingbtn${j}`).addEventListener("click", DeleteIngredientsRow);
    u.ID(`upbtn${j}`).addEventListener("click", MoveIngredientsRow);
    u.ID(`downbtn${j}`).addEventListener("click", MoveIngredientsRow);

}
/** Deletes a given ingredient row */
function DeleteIngredientsRow(){
    let i = u.GetNumber(event.target.id)+1;
    u.ID("ingredientTable").deleteRow(i);
    // renumber the ids of all the rows below the deleted row
    let len = u.ID("ingredientTable").rows.length;
    for (i; i<len; i++){
        u.ID(`selectIngredientFood${i}`).id=`selectIngredientFood${i-1}`;
        u.ID(`ingredientQuantitySmall${i}`).id=`ingredientQuantitySmall${i-1}`;
        u.ID(`ingredientUnitDisplay${i}`).id=`ingredientUnitDisplay${i-1}`;
        u.ID(`selectIngredientMorv${i}`).id=`selectIngredientMorv${i-1}`;
        u.ID(`-ingbtn${i}`).id=`-ingbtn${i-1}`;
        u.ID(`+ingbtn${i}`).id=`+ingbtn${i-1}`;
    }

}
/** Displays unit of food[j] in ingredientTable */
function DisplayUnit(i) {
    if(typeof i === "object"){
        i = u.GetNumber(event.target.id);
    }
    if (u.ID(`selectIngredientFood${i}`).value === "Food") {
        u.ID(`ingredientUnitDisplay${i}`).innerText = "";
    }
    else {
        u.ID(`ingredientUnitDisplay${i}`).innerText = Dict.foods[u.ID(`selectIngredientFood${i}`).value].unit;
    }
}

/** move an ingredient */
function MoveIngredientsRow(){
    let i = u.GetNumber(event.target.id);
    let j;
    if(event.target.id.charAt(0)==="u"){ j = i-1; }
    else {  j= i+1; }
    let rowContents = [u.ID(`selectIngredientFood${i}`).value,u.ID(`ingredientQuantitySmall${i}`).value,u.ID(`selectIngredientMorv${i}`).value];
    u.SetValues([[`selectIngredientFood${i}`,u.ID(`selectIngredientFood${j}`).value],[`ingredientQuantitySmall${i}`,u.ID(`ingredientQuantitySmall${j}`).value],[`selectIngredientMorv${i}`,u.ID(`selectIngredientMorv${j}`).value]]);
    u.SetValues([[`selectIngredientFood${j}`,rowContents[0]],[`ingredientQuantitySmall${j}`,rowContents[1]],[`selectIngredientMorv${j}`,rowContents[2]]]);
    DisplayUnit(i);
    DisplayUnit(j);
}

module.exports = {
    CreateIngredientTable:CreateIngredientTable,
    AddIngredientsRow:AddIngredientsRow,
    btn:AddRecipeBtn,
    onLoad:onLoad
};
