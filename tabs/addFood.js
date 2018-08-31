var u = require("../UtilityFunctions.js");
var d = require("../Dicts.js");
var Dict = d.Dict;
var tagsInput = require('tags-input');

// onLoad
function onLoad() {
    u.ID("addfood_btn").addEventListener("click", AddFoodBtn);

    var allergenInput = u.CreateElement("input", u.ID("allergenDiv"), "allergenInput"); //this is actually hidden by the tags-input library - but stores the resultant value
    tagsInput(allergenInput, "allergenList","create"," ");
    allergenInput.setAttribute('type', 'tags');

}

/** adds a food to Dict.foods based on the info in the add food tab */
function AddFoodBtn() {

    let thing = u.ID("foodThing").value.toLowerCase();
    let shop = u.ID("selectFoodShop").value;
    let foodType = u.ID("selectFoodType").value;
    let foodUnitVal = u.ID("foodUnit").value;
    let foodUnit = foodUnitVal === "" ? null : foodUnitVal;
    let allergens = u.ID("allergenInput").value.split(" ");

    Dict.foods.addFood(thing, foodUnit, shop, foodType, allergens);
    u.SetValues([["foodThing", ""], ["foodUnit", ""], ["selectFoodShop", "Shop"], ["selectFoodType", "Food Type"]]);

    tagsInput(u.ID('allergenInput'),"","clear"," ");

    u.WriteDict(1);
    u.WriteConfig();

    for (let i = 0; i + 1 < u.ID("ingredientTable").rows.length; i++) {
        var select = u.ID(`selectIngredientFood${i}`);

        u.CreateDropdown(select.id, Dict.foods, true,undefined,select.value);

    }
}

module.exports = {
    btn: AddFoodBtn,
    onLoad: onLoad
};
